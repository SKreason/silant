from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    CLIENT = "CL"
    SERV_ORG = "SO"
    MANAGER = "MR"
    TypeUser = {
        CLIENT: 'Клиент', SERV_ORG: 'Сервисная организация', MANAGER: 'Менеджер'
    }
    type = models.CharField(max_length=2, choices=TypeUser, default=CLIENT, verbose_name='Роль')
    fullname = models.CharField(max_length=128, null=True, blank=True, verbose_name='Полное имя')

    def __str__(self):
        if self.fullname:
            return self.fullname
        return self.username

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

class ReferenceDirectory(models.Model):
    DIR_TYPES = {
        'model_tech': 'Модель техники',
        'model_engine': 'Модель двигателя',
        'model_transmission': 'Модель трансмиссии',
        'model_drive_bridge': 'Модель ведущего моста',
        'model_control_bridge': 'Модель управляемого моста',
        'type_maintenance': 'Вид ТО',
        'node_fail': 'Узел отказа',
        'method_recovery': 'Способ восстановления'
    }
    ref_type = models.CharField(max_length=32, choices=DIR_TYPES, verbose_name='Тип справочника')
    name = models.CharField(max_length=128, verbose_name='Название')
    description = models.TextField(blank=True, null=True, verbose_name='Описание')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Справочник'
        verbose_name_plural = 'Справочники'


class Vehicle(models.Model):
    factory_number = models.CharField(max_length=128, unique=True, verbose_name='Зав. № машины',
                                         error_messages={'unique': 'Номер используется'})
    vehicle_model = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'model_tech'},
                                      on_delete=models.CASCADE, related_name='model_tech',
                                      verbose_name='Модель техники')
    engine_model = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'model_engine'},
                                     on_delete=models.CASCADE, related_name='engine_models',
                                     verbose_name='Модель двигателя')
    engine_number = models.CharField(max_length=128, unique=True, verbose_name='Зав. № двигателя',
                                         error_messages={'unique': 'Номер используется'})
    transmission_model = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'model_transmission'},
                                           on_delete=models.CASCADE, related_name='model_transmission',
                                           verbose_name='Модель трансмиссии')
    transmission_number = models.CharField(max_length=128, unique=True, verbose_name='Зав. № трансмиссии',
                                         error_messages={'unique': 'Номер используется'})
    drive_bridge_model = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'model_drive_bridge'},
                                           on_delete=models.CASCADE, related_name='model_drive_bridge',
                                         verbose_name='Модель ведущего моста')
    drive_bridge_number = models.CharField(max_length=128, unique=True, verbose_name='Зав. № ведущего моста',
                                         error_messages={'unique': 'Номер используется'})
    control_bridge_model = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'model_control_bridge'},
                                            on_delete=models.CASCADE, related_name='model_control_bridge',
                                            verbose_name='Модель управляемого моста')
    control_bridge_number = models.CharField(max_length=128, unique=True, verbose_name='Зав. № управляемого моста',
                                         error_messages={'unique': 'Номер используется'})
    supply_contract = models.CharField(max_length=128, verbose_name='Договор поставки №, дата')
    shipping_date = models.DateField(verbose_name='Дата отгрузки с завода')
    recipient = models.CharField(max_length=128, verbose_name='Грузополучатель (конечный потребитель)')
    delivery_address = models.CharField(max_length=128, verbose_name='Адрес поставки (эксплуатации)')
    equipment = models.TextField(verbose_name='Комплектация (доп. опции)')
    client = models.ForeignKey(User, limit_choices_to={'type': 'CL'}, on_delete=models.CASCADE,
                               related_name='clients', verbose_name='Клиент')
    service = models.ForeignKey(User, limit_choices_to={'type': 'SO'}, on_delete=models.CASCADE,
                                related_name='services', verbose_name='Сервисная компания')

    def __str__(self):
        return self.factory_number

    class Meta:
        verbose_name = 'Машина'
        verbose_name_plural = 'Машины'


class Maintenance(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='vehicle_maintenance',
                                verbose_name='Машина')
    maintenance_type = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'type_maintenance'},
                                         on_delete=models.CASCADE, related_name='type_maintenance',
                                         verbose_name='Вид ТО')
    maintenance_date = models.DateField(verbose_name='Дата проведения ТО')
    operating_time = models.IntegerField(verbose_name='Наработка, м/час')
    order_number = models.CharField(max_length=128, unique=True, verbose_name='№ заказ-наряда',
                                         error_messages={'unique': 'Номер используется'})
    order_date = models.DateField(verbose_name='Дата заказ-наряда')
    service = models.ForeignKey(User, limit_choices_to={'type': 'SO'}, on_delete=models.SET_NULL,
                                null=True, blank=True, related_name='company_maintenance',
                                verbose_name='Организация, проводившая ТО')

    def get_value(self):
        if self.service is None:
            return 'Самостоятельно'
        return str(self.service)

    class Meta:
        verbose_name = 'TO'
        verbose_name_plural = 'TO'



class WarrantyClaim(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='vehicle_warranty_claim',
                                verbose_name='Mашина')
    failure_date = models.DateField(verbose_name='Дата отказа')
    operating_time = models.IntegerField(verbose_name='Наработка, м/час')
    node_fail = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'node_fail'},
                                     on_delete=models.CASCADE, related_name='node_fail',
                                     verbose_name='Узел отказа')
    fail_description = models.CharField(max_length=128, verbose_name='Описание отказа')
    method_recovery = models.ForeignKey(ReferenceDirectory, limit_choices_to={'ref_type': 'method_recovery'},
                                        on_delete=models.CASCADE, related_name='method_recovery',
                                        verbose_name='Способ восстановления')
    spare_parts = models.CharField(max_length=128, null=True, blank=True, verbose_name='Используемые запасные части')
    recovery_date = models.DateField(verbose_name='Дата восстановления')
    downtime = models.IntegerField(editable=False, verbose_name='Время простоя техники')
    service = models.ForeignKey(User, limit_choices_to={'type': 'SO'}, on_delete=models.CASCADE,
                                related_name='company_warranty_claim', verbose_name='Cервисная компания')

    def save(self, *args, **kwargs):
        self.downtime = (self.recovery_date - self.failure_date).days
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Рекламация'
        verbose_name_plural = 'Рекламации'

