from datetime import datetime
import pytz

from django.contrib.auth import get_user_model, authenticate
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken

from .models import ReferenceDirectory, Vehicle, Maintenance, WarrantyClaim

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
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

        data['access_expires_at'] = datetime.fromtimestamp(
            access.payload['exp'],
            tz=pytz.timezone('Asia/Yekaterinburg')
        ).timestamp()
        data['refresh_expires_at'] = datetime.fromtimestamp(
            refresh.payload['exp'],
            tz=pytz.timezone('Asia/Yekaterinburg')
        ).timestamp()

        data['user'] = {
            'username': self.user.username,
            'type': self.user.type,
            'fullname': self.user.fullname,
        }
        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        access = AccessToken(data['access'])

        data['access_expires_at'] = datetime.fromtimestamp(
            access.payload['exp'],
            tz=pytz.timezone('Asia/Yekaterinburg')
        ).timestamp()

        return data


class ReferenceDirectorySerializer(serializers.ModelSerializer):
    ref_type_display = serializers.CharField(source='get_ref_type_display', read_only=True)

    class Meta:
        model = ReferenceDirectory
        fields = ['id', 'ref_type', 'ref_type_display', 'name', 'description']


class ClientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'fullname']

    def get_queryset(self):
        return User.objects.filter(type='CL')


class ServiceOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'fullname']

    def get_queryset(self):
        return User.objects.filter(type='SO')


class VehiclePublicSerializer(serializers.ModelSerializer):
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
        return obj.vehicle_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_engine_model(self, obj):
        return obj.engine_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_transmission_model(self, obj):
        return obj.transmission_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_drive_bridge_model(self, obj):
        return obj.drive_bridge_model.name

    @extend_schema_field(OpenApiTypes.STR)
    def get_control_bridge_model(self, obj):
        return obj.control_bridge_model.name


class VehicleSerializer(serializers.ModelSerializer):
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
        return {
            'id': obj.client.id,
            'fullname': obj.client.fullname,
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_service(self, obj):
        return {
            'id': obj.service.id,
            'fullname': obj.service.fullname,
        }


class MaintenanceSerializer(serializers.ModelSerializer):
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
        return {
            'id': obj.service.id if obj.service else '',
            'fullname': obj.service.fullname if obj.service else 'Cамостоятельно',
        }

    def validate(self, data):
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
        return {
            'id': obj.vehicle.id,
            'number': obj.vehicle.factory_number
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_service(self, obj):
        return {
            'id': obj.service.id,
            'fullname': obj.service.fullname,
        }
