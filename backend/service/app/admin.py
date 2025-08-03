from django.conf import settings
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.core.mail import send_mail
import string
import secrets

from .models import User, ReferenceDirectory, Vehicle, Maintenance, WarrantyClaim


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'type', 'email', 'fullname', 'is_staff']
    list_filter = ['username', 'type', 'email', 'fullname', 'is_staff']

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('type', 'fullname')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')})
    )

    add_fieldsets = [
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'type', 'fullname')
        })
    ]


@admin.register(ReferenceDirectory)
class ReferenceDirectoryAdmin(admin.ModelAdmin):
    list_display = ('ref_type', 'name', 'description')
    list_filter = ('ref_type',)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('factory_number', 'get_vehicle_model', 'get_client', 'get_service')
    list_filter = ('factory_number',)

    def get_vehicle_model(self, obj):
        return obj.vehicle_model.name
    get_vehicle_model.short_description = 'Модель техники'

    def get_client(self, obj):
        return obj.client.fullname
    get_client.short_description = 'Клиент'

    def get_service(self, obj):
        return obj.service.fullname
    get_service.short_description = 'Сервисная компания'


@admin.register(Maintenance)
class Maintenance(admin.ModelAdmin):
    list_display = ('get_maintenance_type', 'maintenance_date', 'get_vehicle', 'get_service')
    list_filter = ('vehicle', 'maintenance_type')

    def get_maintenance_type(self, obj):
        return obj.maintenance_type.name
    get_maintenance_type.short_description = 'Вид ТО'


    def get_vehicle(self, obj):
        return obj.vehicle.factory_number
    get_vehicle.short_description = 'Машина'

    def get_service(self, obj):
        if obj.service is not None:
            return obj.service.fullname
        return 'Хозспособ'
    get_service.short_description = 'Организация, проводившая ТО'


@admin.register(WarrantyClaim)
class WarrantyClaim(admin.ModelAdmin):
    list_display = ('get_vehicle', 'operating_time', 'failure_date', 'recovery_date', 'get_recovery_method')
    list_filter = ('vehicle',)

    def get_recovery_method(self, obj):
        return obj.recovery_method.name
    get_recovery_method.short_description = 'Способ восстановления'

    def get_vehicle(self, obj):
        return obj.vehicle.factory_number
    get_vehicle.short_description = 'Машина'


# admin.site.register(User)
# admin.site.register(ReferenceDirectory)
# admin.site.register(Maintenance)
# admin.site.register(WarrantyClaim)