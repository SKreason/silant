"""
Административный интерфейс Django для управления моделями системы.

Настройки административных классов для:
- User - пользователи системы
- ReferenceDirectory - справочники
- Vehicle - техника
- Maintenance - техническое обслуживание
- WarrantyClaim - рекламации
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin


from .models import User, ReferenceDirectory, Vehicle, Maintenance, WarrantyClaim


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Административный класс для модели User.

    Наследует стандартный UserAdmin и добавляет кастомные поля:
    - type - роль пользователя
    - fullname - полное имя
    """

    # Поля для отображения в списке
    list_display = ['username', 'type', 'email', 'fullname', 'is_staff']

    # Поля для фильтрации
    list_filter = ['username', 'type', 'email', 'fullname', 'is_staff']

    # Группировка полей в форме редактирования
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('type', 'fullname')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')})
    )

    # Поля для формы добавления пользователя
    add_fieldsets = [
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'type', 'fullname')
        })
    ]


@admin.register(ReferenceDirectory)
class ReferenceDirectoryAdmin(admin.ModelAdmin):
    """
    Административный класс для справочников.

    Отображает:
    - Тип справочника
    - Название
    - Описание
    """

    list_display = ('ref_type', 'name', 'description')
    list_filter = ('ref_type',)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """
    Административный класс для техники.

    Отображает:
    - Заводской номер
    - Модель техники
    - Клиента
    - Сервисную компанию

    С кастомными методами для отображения связанных полей.
    """

    list_display = ('factory_number', 'get_vehicle_model', 'get_client', 'get_service')
    list_filter = ('factory_number',)

    def get_vehicle_model(self, obj):
        """Возвращает название модели техники."""
        return obj.vehicle_model.name
    get_vehicle_model.short_description = 'Модель техники'

    def get_client(self, obj):
        """Возвращает полное имя клиента."""
        return obj.client.fullname
    get_client.short_description = 'Клиент'

    def get_service(self, obj):
        """Возвращает полное имя сервисной компании."""
        return obj.service.fullname
    get_service.short_description = 'Сервисная компания'


@admin.register(Maintenance)
class Maintenance(admin.ModelAdmin):
    """
    Административный класс для ТО.

    Отображает:
    - Вид ТО
    - Дату проведения
    - Технику
    - Сервисную организацию

    С кастомной обработкой случая самостоятельного обслуживания.
    """

    list_display = ('get_maintenance_type', 'maintenance_date', 'get_vehicle', 'get_service')
    list_filter = ('vehicle', 'maintenance_type')

    def get_maintenance_type(self, obj):
        """Возвращает название вида ТО."""
        return obj.maintenance_type.name
    get_maintenance_type.short_description = 'Вид ТО'

    def get_vehicle(self, obj):
        """Возвращает заводской номер техники."""
        return obj.vehicle.factory_number
    get_vehicle.short_description = 'Машина'

    def get_service(self, obj):
        """
        Возвращает сервисную организацию или 'Самостоятельно'.

        Args:
            obj: Объект Maintenance

        Returns:
            str: Название сервисной организации или 'Самостоятельно'
        """
        if obj.service is not None:
            return obj.service.fullname
        return 'Самостоятельно'
    get_service.short_description = 'Организация, проводившая ТО'


@admin.register(WarrantyClaim)
class WarrantyClaim(admin.ModelAdmin):
    """
    Административный класс для рекламаций.

    Отображает:
    - Технику
    - Наработку
    - Дату отказа
    - Дату восстановления
    - Способ восстановления
    """

    list_display = ('get_vehicle', 'operating_time', 'failure_date', 'recovery_date', 'get_method_recovery')
    list_filter = ('vehicle',)

    def get_method_recovery(self, obj):
        """Возвращает название способа восстановления."""
        return obj.method_recovery.name
    get_method_recovery.short_description = 'Способ восстановления'

    def get_vehicle(self, obj):
        """Возвращает заводской номер техники."""
        return obj.vehicle.factory_number
    get_vehicle.short_description = 'Машина'
