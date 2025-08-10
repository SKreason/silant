"""
views.py — Реализация API ViewSet'ов для работы с пользователями, справочниками, транспортными средствами,
техническим обслуживанием и гарантийными случаями.

Данный модуль использует:
- Django REST Framework (ModelViewSet)
- DRF Simple JWT для аутентификации
- drf-spectacular для генерации OpenAPI документации (через декораторы *_schema)
- Сериализаторы из serializers.py
- Права доступа из permissions.py
"""

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .permissions import ReferenceDirectoryPermission, ClientsPermission, ServiceOrganizationPermission, \
    VehiclePermission, MaintenancePermission, WarrantyClaimPermission
from .models import ReferenceDirectory, Vehicle, Maintenance, WarrantyClaim
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, ReferenceDirectorySerializer, \
    ClientsSerializer, ServiceOrganizationSerializer, VehiclePublicSerializer, VehicleSerializer, MaintenanceSerializer, \
    WarrantyClaimSerializer
from .api_schema import reference_directory_schema, clients_schema, service_organization_schema, vehicle_schema, \
    maintenance_schema, warranty_claim_schema

# Получаем модель пользователя
User = get_user_model()


# ---------------------------
# Аутентификация и авторизация
# ---------------------------

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Получение пары токенов доступа/обновления с использованием кастомного сериализатора.
    """
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefresh(TokenRefreshView):
    """
    Обновление токена доступа с использованием кастомного сериализатора.
    """
    serializer_class = CustomTokenRefreshSerializer
    

# ---------------------------
# ViewSet для справочника
# ---------------------------

@reference_directory_schema
class ReferenceDirectoryViewSet(ModelViewSet):
    """
    CRUD для модели ReferenceDirectory (справочники).
    Доступен полный набор методов: GET, POST, PUT, DELETE.
    """
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = ReferenceDirectory.objects.all()
    permission_classes = [ReferenceDirectoryPermission]
    serializer_class = ReferenceDirectorySerializer

    def perform_create(self, serializer):
        """Сохранение нового справочника."""
        serializer.save()

    def perform_update(self, serializer):
        """Обновление существующего справочника."""
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Кастомная логика обновления с поддержкой partial update."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    

# ---------------------------
# ViewSet для клиентов
# ---------------------------

@clients_schema
class ClientsViewSet(ModelViewSet):
    """
    Только чтение списка клиентов (тип пользователя CL).
    """
    http_method_names = ['get', 'head', 'options']
    queryset = User.objects.filter(type='CL')
    permission_classes = [ClientsPermission]
    serializer_class = ClientsSerializer


# ---------------------------
# ViewSet для сервисных организаций
# ---------------------------

@service_organization_schema
class ServiceOrganizationViewSet(ModelViewSet):
    """
    Только чтение списка сервисных организаций (тип пользователя SO).
    """
    http_method_names = ['get', 'head', 'options']
    queryset = User.objects.filter(type='SO')
    permission_classes = [ServiceOrganizationPermission]
    serializer_class = ServiceOrganizationSerializer


# ---------------------------
# ViewSet для транспортных средств
# ---------------------------

@vehicle_schema
class VehicleViewSet(ModelViewSet):
    """
    CRUD для транспортных средств.
    Доступ к данным фильтруется по типу пользователя.
    lookup_field — factory_number (уникальный заводской номер).
    """
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = Vehicle.objects.all()
    lookup_field = 'factory_number'
    permission_classes = [VehiclePermission]

    def get_serializer_class(self):
        """Возвращает публичный сериализатор для неаутентифицированных пользователей."""
        if not self.request.user.is_authenticated:
            return VehiclePublicSerializer
        return VehicleSerializer

    def get_queryset(self):
        """
        Ограничивает выборку в зависимости от типа пользователя:
        - MR: все записи
        - CL: только ТС, принадлежащие клиенту
        - SO: только ТС, закрепленные за сервисной организацией
        """
        queryset = Vehicle.objects.select_related(
            'vehicle_model',
            'engine_model',
            'transmission_model',
            'drive_bridge_model',
            'control_bridge_model',
            'client',
            'service'
        )
        user = self.request.user

        if not user.is_authenticated:
            return queryset

        if user.type == 'MR':
            return queryset
        elif user.type == 'CL':
            return queryset.filter(client=user)
        elif user.type == 'SO':
            return queryset.filter(service=user)

        return Vehicle.objects.none()

    def perform_create(self, serializer):
        """Сохранение нового ТС."""
        serializer.save()

    def perform_update(self, serializer):
        """Обновление существующего ТС."""
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Кастомная логика обновления с поддержкой partial update."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


# ---------------------------
# ViewSet для технического обслуживания
# ---------------------------

@maintenance_schema
class MaintenanceViewSet(ModelViewSet):
    """
    CRUD для записей о техническом обслуживании.
    Доступ фильтруется по типу пользователя.
    """
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = Maintenance.objects.all()
    permission_classes = [MaintenancePermission]
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        """
        Ограничивает выборку в зависимости от типа пользователя:
        - MR: все ТО
        - CL: ТО, связанные с ТС клиента
        - SO: ТО, связанные с ТС обслуживаемыми организацией
        """
        queryset = Maintenance.objects.select_related(
            'maintenance_type',
            'vehicle'
        )
        user = self.request.user

        if user.type == 'MR':
            return queryset
        elif user.type == 'CL':
            return queryset.filter(vehicle__client=user)
        elif user.type == 'SO':
            return queryset.filter(vehicle__service=user)

        return Maintenance.objects.none()

    def perform_create(self, serializer):
        """Сохранение записи ТО."""
        serializer.save()

    def perform_update(self, serializer):
        """Обновление записи ТО."""
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Кастомная логика обновления с поддержкой partial update."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


# ---------------------------
# ViewSet для гарантийных случаев
# ---------------------------

@warranty_claim_schema
class WarrantyClaimViewSet(ModelViewSet):
    """
    CRUD для гарантийных обращений.
    Доступ фильтруется по типу пользователя.
    """
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = WarrantyClaim.objects.all()
    permission_classes = [WarrantyClaimPermission]
    serializer_class = WarrantyClaimSerializer

    def get_queryset(self):
        """
        Ограничивает выборку в зависимости от типа пользователя:
        - MR: все обращения
        - CL: обращения по ТС клиента
        - SO: обращения по ТС, закрепленным за сервисной организацией
        """
        queryset = WarrantyClaim.objects.select_related(
            'node_fail',
            'method_recovery',
            'vehicle'
        )
        user = self.request.user

        if user.type == 'MR':
            return queryset
        elif user.type == 'CL':
            return queryset.filter(vehicle__client=user)
        elif user.type == 'SO':
            return queryset.filter(vehicle__service=user)

        return WarrantyClaim.objects.none()

    def perform_create(self, serializer):
        """Сохранение обращения."""
        serializer.save()

    def perform_update(self, serializer):
        """Обновление обращения."""
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Кастомная логика обновления с поддержкой partial update."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
