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

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefresh(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
    

@reference_directory_schema
class ReferenceDirectoryViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = ReferenceDirectory.objects.all()
    permission_classes = [ReferenceDirectoryPermission]
    serializer_class = ReferenceDirectorySerializer

    def perform_create(self, serializer):
        try:
            serializer.save()
        except Exception as e:
            raise

    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
    
    
@clients_schema
class ClientsViewSet(ModelViewSet):
    http_method_names = ['get', 'head', 'options']
    queryset = User.objects.filter(type='CL')
    permission_classes = [ClientsPermission]
    serializer_class = ClientsSerializer


@service_organization_schema
class ServiceOrganizationViewSet(ModelViewSet):
    http_method_names = ['get', 'head', 'options']
    queryset = User.objects.filter(type='SO')
    permission_classes = [ServiceOrganizationPermission]
    serializer_class = ServiceOrganizationSerializer


@vehicle_schema
class VehicleViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = Vehicle.objects.all()
    lookup_field = 'factory_number'
    permission_classes = [VehiclePermission]

    def get_serializer_class(self):
        if not self.request.user.is_authenticated:
            return VehiclePublicSerializer
        return VehicleSerializer

    def get_queryset(self):
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
        try:
            serializer.save()
        except Exception as e:
            raise

    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


@maintenance_schema
class MaintenanceViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = Maintenance.objects.all()
    permission_classes = [MaintenancePermission]
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
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
        try:
            serializer.save()
        except Exception as e:
            raise

    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


@warranty_claim_schema
class WarrantyClaimViewSet(ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    queryset = WarrantyClaim.objects.all()
    permission_classes = [WarrantyClaimPermission]
    serializer_class = WarrantyClaimSerializer

    def get_queryset(self):
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
        try:
            serializer.save()
        except Exception as e:
            raise

    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
