"""
Сериализаторы для приложения управления техникой и сервисными операциями.

Этот модуль содержит сериализаторы Django REST Framework для работы с:
- Аутентификацией (JWT токены)
- Справочниками
- Техникой (Vehicle)
- Техническим обслуживанием (Maintenance)
- Рекламациями (WarrantyClaim)
"""

from datetime import datetime
import pytz

from django.contrib.auth import get_user_model, authenticate
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken

from .models import ReferenceDirectory, Vehicle, Maintenance, WarrantyClaim

# Получаем модель пользователя
User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Кастомный сериализатор для получения JWT токенов с дополнительными полями."""

    def validate(self, attrs):
        """
        Валидация учетных данных и формирование ответа с токенами.

        Добавляет к стандартному ответу:
        - Сроки действия access и refresh токенов
        - Основную информацию о пользователе

        Args:
            attrs (dict): Входные данные (username, password)

        Returns:
            dict: Ответ с токенами и дополнительной информацией

        Raises:
            ValidationError: Если аутентификация не удалась
        """
        auth_kwargs = {
            'username': attrs['username'],
            'password': attrs['password'],
        }

        user = authenticate(**auth_kwargs)

        if user is None:
            raise serializers.ValidationError({
                'error': 'Неверный логин или пароль'
            })

        data = super().validate(attrs)

        refresh = self.get_token(self.user)
        access = refresh.access_token

        # Добавляем сроки действия токенов в формате timestamp
        data['access_expires_at'] = datetime.fromtimestamp(
            access.payload['exp'],
            tz=pytz.timezone('Asia/Yekaterinburg')
        ).timestamp()
        data['refresh_expires_at'] = datetime.fromtimestamp(
            refresh.payload['exp'],
            tz=pytz.timezone('Asia/Yekaterinburg')
        ).timestamp()

        # Добавляем основную информацию о пользователе
        data['user'] = {
            'username': self.user.username,
            'type': self.user.type,
            'fullname': self.user.fullname,
        }
        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """Кастомный сериализатор для обновления JWT токена с добавлением срока действия нового access токена."""

    def validate(self, attrs):
        """
        Обновление access токена и добавление информации о сроке его действия.

        Args:
            attrs (dict): Входные данные (refresh токен)

        Returns:
            dict: Новый access токен и срок его действия
        """

        data = super().validate(attrs)

        access = AccessToken(data['access'])

        # Добавляем срок действия нового access токена
        data['access_expires_at'] = datetime.fromtimestamp(
            access.payload['exp'],
            tz=pytz.timezone('Asia/Yekaterinburg')
        ).timestamp()

        return data


class ReferenceDirectorySerializer(serializers.ModelSerializer):
    """Сериализатор для справочников."""

    ref_type_display = serializers.CharField(source='get_ref_type_display', read_only=True)

    class Meta:
        model = ReferenceDirectory
        fields = ['id', 'ref_type', 'ref_type_display', 'name', 'description']


class ClientsSerializer(serializers.ModelSerializer):
    """Сериализатор для клиентов (пользователей с типом 'CL')."""

    class Meta:
        model = User
        fields = ['id', 'fullname']

    def get_queryset(self):
        """Возвращает только пользователей с типом 'CL' (клиенты)."""
        return User.objects.filter(type='CL')


class ServiceOrganizationSerializer(serializers.ModelSerializer):
    """Сериализатор для сервисных организаций (пользователей с типом 'SO')."""

    class Meta:
        model = User
        fields = ['id', 'fullname']

    def get_queryset(self):
        """Возвращает только пользователей с типом 'SO' (сервисные организации)."""
        return User.objects.filter(type='SO')


class VehiclePublicSerializer(serializers.ModelSerializer):
    """Сериализатор для публичного отображения информации о технике (без привязки к клиентам)."""

    vehicle_model = serializers.SerializerMethodField()
    engine_model = serializers.SerializerMethodField()
    transmission_model = serializers.SerializerMethodField()
    drive_bridge_model = serializers.SerializerMethodField()
    control_bridge_model = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'factory_number', 'vehicle_model', 'engine_model', 'engine_number', 'transmission_model',
            'transmission_number', 'drive_bridge_model', 'drive_bridge_number', 'control_bridge_model',
            'control_bridge_number'
        ]

    @extend_schema_field(OpenApiTypes.STR)
    def get_vehicle_model(self, obj):
        """Возвращает название модели техники."""
        return obj.vehicle_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_engine_model(self, obj):
        """Возвращает название модели двигателя."""
        return obj.engine_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_transmission_model(self, obj):
        """Возвращает название модели трансмиссии."""
        return obj.transmission_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_drive_bridge_model(self, obj):
        """Возвращает название модели ведущего моста."""
        return obj.drive_bridge_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_control_bridge_model(self, obj):
        """Возвращает название модели управляемого моста."""
        return obj.control_bridge_model.name


class VehicleSerializer(serializers.ModelSerializer):
    """Полный сериализатор для техники со всеми связями."""

    vehicle_model = ReferenceDirectorySerializer(read_only=True)
    vehicle_model_id = serializers.PrimaryKeyRelatedField(
        source='vehicle_model',
        queryset=ReferenceDirectory.objects.filter(ref_type='model_tech')
    )
    engine_model = ReferenceDirectorySerializer(read_only=True)
    engine_model_id = serializers.PrimaryKeyRelatedField(
        source='engine_model',
        queryset=ReferenceDirectory.objects.filter(ref_type='model_engine')
    )
    transmission_model = ReferenceDirectorySerializer(read_only=True)
    transmission_model_id = serializers.PrimaryKeyRelatedField(
        source='transmission_model',
        queryset=ReferenceDirectory.objects.filter(ref_type='model_transmission')
    )
    drive_bridge_model = ReferenceDirectorySerializer(read_only=True)
    drive_bridge_model_id = serializers.PrimaryKeyRelatedField(
        source='drive_bridge_model',
        queryset=ReferenceDirectory.objects.filter(ref_type='model_drive_bridge')
    )
    control_bridge_model = ReferenceDirectorySerializer(read_only=True)
    control_bridge_model_id = serializers.PrimaryKeyRelatedField(
        source='control_bridge_model',
        queryset=ReferenceDirectory.objects.filter(ref_type='model_control_bridge')
    )
    client = serializers.SerializerMethodField()
    client_id = serializers.PrimaryKeyRelatedField(
        source='client',
        queryset=User.objects.filter(type='CL')
    )
    service = serializers.SerializerMethodField()
    service_id = serializers.PrimaryKeyRelatedField(
        source='service',
        queryset=User.objects.filter(type='SO')
    )

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'factory_number',
            'vehicle_model',
            'vehicle_model_id',
            'engine_model',
            'engine_model_id',
            'engine_number',
            'transmission_model',
            'transmission_model_id',
            'transmission_number',
            'drive_bridge_model',
            'drive_bridge_model_id',
            'drive_bridge_number',
            'control_bridge_model',
            'control_bridge_model_id',
            'control_bridge_number',
            'supply_contract',
            'shipping_date',
            'recipient',
            'delivery_address',
            'equipment',
            'client',
            'client_id',
            'service',
            'service_id',
        ]
        extra_kwargs = {
            'vehicle_model_id': {'write_only': True},
            'engine_model_id': {'write_only': True},
            'transmission_model_id': {'write_only': True},
            'drive_bridge_model_id': {'write_only': True},
            'control_bridge_model_id': {'write_only': True},
            'client_id': {'write_only': True},
            'service_id': {'write_only': True},
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_client(self, obj):
        """Возвращает информацию о клиенте в формате {id, fullname}."""
        return {
            'id': obj.client.id,
            'fullname': obj.client.fullname,
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_service(self, obj):
        """Возвращает информацию о сервисной организации в формате {id, fullname}."""
        return {
            'id': obj.service.id,
            'fullname': obj.service.fullname,
        }


class MaintenanceSerializer(serializers.ModelSerializer):
    """Сериализатор для записей о техническом обслуживании."""

    maintenance_type = ReferenceDirectorySerializer(read_only=True)
    maintenance_type_id = serializers.PrimaryKeyRelatedField(
        source='maintenance_type',
        queryset=ReferenceDirectory.objects.filter(ref_type='type_maintenance')
    )
    vehicle = serializers.SerializerMethodField()
    vehicle_id = serializers.PrimaryKeyRelatedField(
        source='vehicle',
        queryset=Vehicle.objects.all()
    )
    service = serializers.SerializerMethodField()

    class Meta:
        model = Maintenance
        fields = [
            'id',
            'vehicle',
            'vehicle_id',
            'maintenance_type',
            'maintenance_type_id',
            'maintenance_date',
            'operating_time',
            'order_number',
            'order_date',
            'service',
        ]
        extra_kwargs = {
            'maintenance_type_id': {'write_only': True},
            'vehicle_id': {'write_only': True},
        }

    @extend_schema_field({
        'type': 'object',
        'properties': {
            'id': {'type': 'integer'},
            'number': {'type': 'string'}
        }
    })
    def get_vehicle(self, obj):
        """Возвращает информацию о технике в формате {id, factory_number}."""
        return {
            'id': obj.vehicle.id,
            'number': obj.vehicle.factory_number
        }

    @extend_schema_field({
        'type': 'object',
        'properties': {
            'id': {'type': 'integer'} | {'type': 'string'},
            'number': {'type': 'string'}
        }
    })
    def get_service(self, obj):
        """Возвращает информацию о сервисной организации или строку 'Самостоятельно'."""
        return {
            'id': obj.service.id if obj.service else '',
            'fullname': obj.service.fullname if obj.service else 'Cамостоятельно',
        }

    def validate(self, data):
        """
        Проверка, что для данной техники не существует уже ТО такого типа.

        Args:
            data (dict): Входные данные для валидации

        Returns:
            dict: Валидированные данные

        Raises:
            ValidationError: Если ТО такого типа для этой техники уже существует
        """
        maintenance_type = data.get('maintenance_type')
        vehicle = data.get('vehicle')

        if maintenance_type and vehicle:
            existing_maintenance = Maintenance.objects.filter(
                vehicle=vehicle, maintenance_type=maintenance_type
            )

            if self.instance:
                existing_maintenance = existing_maintenance.exclude(id=self.instance.id)

            if existing_maintenance.exists():
                raise serializers.ValidationError({'type': 'ТО уже существует'})

        return super().validate(data)


class WarrantyClaimSerializer(serializers.ModelSerializer):
    """Сериализатор для рекламаций по гарантии."""
    node_fail = ReferenceDirectorySerializer(read_only=True)
    node_fail_id = serializers.PrimaryKeyRelatedField(
        source='node_fail',
        queryset=ReferenceDirectory.objects.filter(ref_type='node_fail')
    )
    method_recovery = ReferenceDirectorySerializer(read_only=True)
    method_recovery_id = serializers.PrimaryKeyRelatedField(
        source='method_recovery',
        queryset=ReferenceDirectory.objects.filter(ref_type='method_recovery')
    )
    vehicle = serializers.SerializerMethodField()
    vehicle_id = serializers.PrimaryKeyRelatedField(
        source='vehicle',
        queryset=Vehicle.objects.all()
    )
    service = serializers.SerializerMethodField()
    service_id = serializers.PrimaryKeyRelatedField(
        source='service',
        queryset=User.objects.filter(type='SO')
    )

    class Meta:
        model = WarrantyClaim
        fields = [
            'id',
            'node_fail',
            'node_fail_id',
            'method_recovery',
            'method_recovery_id',
            'vehicle',
            'vehicle_id',
            'downtime',
            'operating_time',
            'fail_description',
            'failure_date',
            'recovery_date',
            'spare_parts',
            'service',
            'service_id'
        ]
        extra_kwargs = {
            'node_fail_id': {'write_only': True},
            'method_recovery_id': {'write_only': True},
            'vehicle_id': {'write_only': True},
            'service_id': {'write_only': True},
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_vehicle(self, obj):
        """Возвращает информацию о технике в формате {id, factory_number}."""
        return {
            'id': obj.vehicle.id,
            'number': obj.vehicle.factory_number
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_service(self, obj):
        """Возвращает информацию о сервисной организации в формате {id, fullname}."""
        return {
            'id': obj.service.id,
            'fullname': obj.service.fullname,
        }
