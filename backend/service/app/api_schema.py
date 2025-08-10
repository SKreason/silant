from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .serializers import (
    ReferenceDirectorySerializer,
    ClientsSerializer,
    ServiceOrganizationSerializer,
    VehicleSerializer,
    MaintenanceSerializer,
    WarrantyClaimSerializer
)

reference_directory_schema = extend_schema_view(
    list=extend_schema(
        summary="Получить список всех справочников",
        description="Возвращает список всех справочных данных с возможностью фильтрации по типу.",
        responses={
            200: ReferenceDirectorySerializer(many=True),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value=[
                    {
                        "id": 1,
                        "ref_type": "model_tech",
                        "ref_type_display": "Модель техники",
                        "name": "ПД1,5",
                        "description": "Дизельный погрузчик, грузоподъемность 1,5 тонны"
                    },
                    {
                        "id": 2,
                        "ref_type": "model_engine",
                        "ref_type_display": "Модель двигателя",
                        "name": "Kubota D1803",
                        "description": "Дизельный двигатель, 3 цилиндра, 1,8 л"
                    }
                ],
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Получить информацию о записи справочника",
        description="Возвращает полную информацию о записи справочника по ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID записи справочника",
                required=True,
                type=int
            )
        ],
        responses={
            200: ReferenceDirectorySerializer,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Запись не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value={
                    "id": 1,
                    "ref_type": "model_tech",
                    "ref_type_display": "Модель техники",
                    "name": "ПД1,5",
                    "description": "Дизельный погрузчик, грузоподъемность 1,5 тонны"
                },
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    create=extend_schema(
        summary="Создать новую запись в справочнике",
        description="Создание новой записи в справочнике (доступно только менеджерам).",
        responses={
            201: ReferenceDirectorySerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "ref_type": "model_tech",
                    "name": "Новая модель",
                    "description": "Описание новой модели"
                },
                request_only=True
            )
        ]
    ),
    update=extend_schema(
        summary="Обновить запись в справочнике",
        description="Полное обновление записи в справочнике (доступно только менеджерам).",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID записи справочника",
                required=True,
                type=int
            )
        ],
        responses={
            200: ReferenceDirectorySerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Запись не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "ref_type": "model_tech",
                    "name": "Обновленная модель",
                    "description": "Обновленное описание"
                },
                request_only=True
            )
        ]
    ),
    destroy=extend_schema(
        summary="Удалить запись из справочника",
        description="Удаление записи из справочника (доступно только менеджерам).",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID записи справочника",
                required=True,
                type=int
            )
        ],
        responses={
            204: None,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Запись не найдена")
        }
    )
)

clients_schema = extend_schema_view(
    list=extend_schema(
        summary="Получить список клиентов",
        description="Возвращает список всех клиентов (доступно менеджерам).",
        responses={
            200: ClientsSerializer(many=True),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value=[
                    {
                        "id": 1,
                        "fullname": "ИП Иванов И.И."
                    },
                    {
                        "id": 2,
                        "fullname": "ООО Ромашка"
                    }
                ],
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Получить информацию о клиенте",
        description="Возвращает информацию о клиенте по ID (доступно менеджерам).",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID клиента",
                required=True,
                type=int
            )
        ],
        responses={
            200: ClientsSerializer,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Клиент не найден")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value={
                    "id": 1,
                    "fullname": "ИП Иванов И.И."
                },
                response_only=True,
                status_codes=["200"]
            )
        ]
    )
)

service_organization_schema = extend_schema_view(
    list=extend_schema(
        summary="Получить список сервисных организаций",
        description="Возвращает список всех сервисных организаций.",
        responses={
            200: ServiceOrganizationSerializer(many=True),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value=[
                    {
                        "id": 3,
                        "fullname": "ООО Сервисная компания 1"
                    },
                    {
                        "id": 4,
                        "fullname": "ООО Сервисная компания 2"
                    }
                ],
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Получить информацию о сервисной организации",
        description="Возвращает информацию о сервисной организации по ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID сервисной организации",
                required=True,
                type=int
            )
        ],
        responses={
            200: ServiceOrganizationSerializer,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Организация не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value={
                    "id": 3,
                    "fullname": "ООО Сервисная компания 1"
                },
                response_only=True,
                status_codes=["200"]
            )
        ]
    )
)

vehicle_schema = extend_schema_view(
    list=extend_schema(
        summary="Получить список машин",
        description="Возвращает список машин с учетом прав доступа пользователя.",
        responses={
            200: VehicleSerializer(many=True),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа для менеджера",
                value=[
                    {
                        "id": 1,
                        "factory_number": "0017",
                        "vehicle_model": {
                            "id": 1,
                            "ref_type": "model_tech",
                            "ref_type_display": "Модель техники",
                            "name": "ПД1,5",
                            "description": "Описание модели"
                        },
                        "engine_model": {
                            "id": 2,
                            "ref_type": "model_engine",
                            "ref_type_display": "Модель двигателя",
                            "name": "Kubota D1803",
                            "description": "Описание двигателя"
                        },
                        "engine_number": "7ML1035",
                        "transmission_model": {
                            "id": 3,
                            "ref_type": "model_transmission",
                            "ref_type_display": "Модель трансмиссии",
                            "name": "10VA-00105",
                            "description": "Описание трансмиссии"
                        },
                        "transmission_number": "21D0108251",
                        "drive_bridge_model": {
                            "id": 4,
                            "ref_type": "model_drive_bridge",
                            "ref_type_display": "Модель ведущего моста",
                            "name": "20VA-00101",
                            "description": "Описание моста"
                        },
                        "drive_bridge_number": "21D0107997",
                        "control_bridge_model": {
                            "id": 5,
                            "ref_type": "model_control_bridge",
                            "ref_type_display": "Модель управляемого моста",
                            "name": "VS20-00001",
                            "description": "Описание моста"
                        },
                        "control_bridge_number": "21D0093265",
                        "supply_contract": "ДГ-0123/2022, 02.02.2022",
                        "shipping_date": "2022-03-09",
                        "recipient": "ИП Трудников С.В.",
                        "delivery_address": "п. Знаменский, Респ. Марий Эл",
                        "equipment": "Дополнительное оборудование",
                        "client": {
                            "id": 1,
                            "fullname": "ИП Трудников С.В."
                        },
                        "service": {
                            "id": 3,
                            "fullname": "ООО Сервисная компания 1"
                        }
                    }
                ],
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Получить информацию о машине",
        description="Возвращает полную информацию о машине по заводскому номеру.",
        parameters=[
            OpenApiParameter(
                name="factory_number",
                location=OpenApiParameter.PATH,
                description="Заводской номер машины",
                required=True,
                type=str
            )
        ],
        responses={
            200: VehicleSerializer,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Машина не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа для неавторизованного пользователя",
                value={
                    "factory_number": "0017",
                    "vehicle_model": "ПД1,5",
                    "engine_model": "Kubota D1803",
                    "engine_number": "7ML1035",
                    "transmission_model": "10VA-00105",
                    "transmission_number": "21D0108251",
                    "drive_bridge_model": "20VA-00101",
                    "drive_bridge_number": "21D0107997",
                    "control_bridge_model": "VS20-00001",
                    "control_bridge_number": "21D0093265"
                },
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    create=extend_schema(
        summary="Создать новую машину",
        description="Создание новой машины (доступно только менеджерам).",
        responses={
            201: VehicleSerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "factory_number": "0018",
                    "vehicle_model_id": 1,
                    "engine_model_id": 2,
                    "engine_number": "7ML1036",
                    "transmission_model_id": 3,
                    "transmission_number": "21D0108252",
                    "drive_bridge_model_id": 4,
                    "drive_bridge_number": "21D0107998",
                    "control_bridge_model_id": 5,
                    "control_bridge_number": "21D0093266",
                    "supply_contract": "ДГ-0124/2022, 03.02.2022",
                    "shipping_date": "2022-03-10",
                    "recipient": "ИП Петров П.П.",
                    "delivery_address": "г. Москва",
                    "equipment": "Дополнительное оборудование",
                    "client_id": 2,
                    "service_id": 4
                },
                request_only=True
            )
        ]
    ),
    update=extend_schema(
        summary="Обновить информацию о машине",
        description="Полное обновление информации о машине (доступно только менеджерам).",
        parameters=[
            OpenApiParameter(
                name="factory_number",
                location=OpenApiParameter.PATH,
                description="Заводской номер машины",
                required=True,
                type=str
            )
        ],
        responses={
            200: VehicleSerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Машина не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "factory_number": "0018",
                    "vehicle_model_id": 1,
                    "engine_model_id": 2,
                    "engine_number": "7ML1036",
                    "transmission_model_id": 3,
                    "transmission_number": "21D0108252",
                    "drive_bridge_model_id": 4,
                    "drive_bridge_number": "21D0107998",
                    "control_bridge_model_id": 5,
                    "control_bridge_number": "21D0093266",
                    "supply_contract": "ДГ-0124/2022, 03.02.2022",
                    "shipping_date": "2022-03-10",
                    "recipient": "ИП Петров П.П.",
                    "delivery_address": "г. Москва",
                    "equipment": "Дополнительное оборудование",
                    "client_id": 2,
                    "service_id": 4
                },
                request_only=True
            )
        ]
    ),
    destroy=extend_schema(
        summary="Удалить машину",
        description="Удаление машины из системы (доступно только менеджерам).",
        parameters=[
            OpenApiParameter(
                name="factory_number",
                location=OpenApiParameter.PATH,
                description="Заводской номер машины",
                required=True,
                type=str
            )
        ],
        responses={
            204: None,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Машина не найдена")
        }
    )
)

maintenance_schema = extend_schema_view(
    list=extend_schema(
        summary="Получить список ТО",
        description="Возвращает список технических обслуживаний с учетом прав доступа пользователя.",
        responses={
            200: MaintenanceSerializer(many=True),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value=[
                    {
                        "id": 1,
                        "vehicle": {
                            "id": 1,
                            "number": "0017"
                        },
                        "maintenance_type": {
                            "id": 6,
                            "ref_type": "type_maintenance",
                            "ref_type_display": "Вид ТО",
                            "name": "ТО-1",
                            "description": "Первое техническое обслуживание"
                        },
                        "maintenance_date": "2022-03-14",
                        "operating_time": 55,
                        "order_number": "#2022-70КЕ87СИЛ",
                        "order_date": "2022-03-12",
                        "service": {
                            "id": 3,
                            "fullname": "ООО Сервисная компания 1"
                        }
                    }
                ],
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Получить информацию о ТО",
        description="Возвращает полную информацию о техническом обслуживании по ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID ТО",
                required=True,
                type=int
            )
        ],
        responses={
            200: MaintenanceSerializer,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="ТО не найдено")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value={
                    "id": 1,
                    "vehicle": {
                        "id": 1,
                        "number": "0017"
                    },
                    "maintenance_type": {
                        "id": 6,
                        "ref_type": "type_maintenance",
                        "ref_type_display": "Вид ТО",
                        "name": "ТО-1",
                        "description": "Первое техническое обслуживание"
                    },
                    "maintenance_date": "2022-03-14",
                    "operating_time": 55,
                    "order_number": "#2022-70КЕ87СИЛ",
                    "order_date": "2022-03-12",
                    "service": {
                        "id": 3,
                        "fullname": "ООО Сервисная компания 1"
                    }
                },
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    create=extend_schema(
        summary="Создать новое ТО",
        description="Создание записи о техническом обслуживании.",
        responses={
            201: MaintenanceSerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "vehicle_id": 1,
                    "maintenance_type_id": 6,
                    "maintenance_date": "2022-04-15",
                    "operating_time": 100,
                    "order_number": "#2022-80КЕ88СИЛ",
                    "order_date": "2022-04-10",
                    "service_id": 3
                },
                request_only=True
            )
        ]
    ),
    update=extend_schema(
        summary="Обновить информацию о ТО",
        description="Обновление информации о техническом обслуживании.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID ТО",
                required=True,
                type=int
            )
        ],
        responses={
            200: MaintenanceSerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="ТО не найдено")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "vehicle_id": 1,
                    "maintenance_type_id": 6,
                    "maintenance_date": "2022-04-15",
                    "operating_time": 100,
                    "order_number": "#2022-80КЕ88СИЛ",
                    "order_date": "2022-04-10",
                    "service_id": 3
                },
                request_only=True
            )
        ]
    ),
    destroy=extend_schema(
        summary="Удалить ТО",
        description="Удаление записи о техническом обслуживании.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID ТО",
                required=True,
                type=int
            )
        ],
        responses={
            204: None,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="ТО не найдено")
        }
    )
)

warranty_claim_schema = extend_schema_view(
    list=extend_schema(
        summary="Получить список рекламаций",
        description="Возвращает список рекламаций с учетом прав доступа пользователя.",
        responses={
            200: WarrantyClaimSerializer(many=True),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value=[
                    {
                        "id": 1,
                        "node_fail": {
                            "id": 7,
                            "ref_type": "node_fail",
                            "ref_type_display": "Узел отказа",
                            "name": "Двигатель",
                            "description": "Отказ двигателя"
                        },
                        "method_recovery": {
                            "id": 8,
                            "ref_type": "method_recovery",
                            "ref_type_display": "Способ восстановления",
                            "name": "Ремонт",
                            "description": "Ремонт узла"
                        },
                        "vehicle": {
                            "id": 1,
                            "number": "0017"
                        },
                        "downtime": 7,
                        "operating_time": 123,
                        "fail_description": "повышенный шум",
                        "failure_date": "2022-04-01",
                        "recovery_date": "2022-04-08",
                        "spare_parts": "прокладки, прочие материалы",
                        "service": {
                            "id": 3,
                            "fullname": "ООО Сервисная компания 1"
                        }
                    }
                ],
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Получить информацию о рекламации",
        description="Возвращает полную информацию о рекламации по ID.",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID рекламации",
                required=True,
                type=int
            )
        ],
        responses={
            200: WarrantyClaimSerializer,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Рекламация не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример успешного ответа",
                value={
                    "id": 1,
                    "node_fail": {
                        "id": 7,
                        "ref_type": "node_fail",
                        "ref_type_display": "Узел отказа",
                        "name": "Двигатель",
                        "description": "Отказ двигателя"
                    },
                    "method_recovery": {
                        "id": 8,
                        "ref_type": "method_recovery",
                        "ref_type_display": "Способ восстановления",
                        "name": "Ремонт",
                        "description": "Ремонт узла"
                    },
                    "vehicle": {
                        "id": 1,
                        "number": "0017"
                    },
                    "downtime": 7,
                    "operating_time": 123,
                    "fail_description": "повышенный шум",
                    "failure_date": "2022-04-01",
                    "recovery_date": "2022-04-08",
                    "spare_parts": "прокладки, прочие материалы",
                    "service": {
                        "id": 3,
                        "fullname": "ООО Сервисная компания 1"
                    }
                },
                response_only=True,
                status_codes=["200"]
            )
        ]
    ),
    create=extend_schema(
        summary="Создать новую рекламацию",
        description="Создание новой рекламации (доступно сервисным организациям и менеджерам).",
        responses={
            201: WarrantyClaimSerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "node_fail_id": 7,
                    "method_recovery_id": 8,
                    "vehicle_id": 1,
                    "operating_time": 123,
                    "fail_description": "повышенный шум",
                    "failure_date": "2022-04-01",
                    "recovery_date": "2022-04-08",
                    "spare_parts": "прокладки, прочие материалы",
                    "service_id": 3
                },
                request_only=True
            )
        ]
    ),
    update=extend_schema(
        summary="Обновить информацию о рекламации",
        description="Обновление информации о рекламации (доступно сервисным организациям и менеджерам).",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID рекламации",
                required=True,
                type=int
            )
        ],
        responses={
            200: WarrantyClaimSerializer,
            400: OpenApiResponse(description="Неверные данные"),
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Рекламация не найдена")
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "node_fail_id": 7,
                    "method_recovery_id": 8,
                    "vehicle_id": 1,
                    "operating_time": 123,
                    "fail_description": "повышенный шум",
                    "failure_date": "2022-04-01",
                    "recovery_date": "2022-04-08",
                    "spare_parts": "прокладки, прочие материалы",
                    "service_id": 3
                },
                request_only=True
            )
        ]
    ),
    destroy=extend_schema(
        summary="Удалить рекламацию",
        description="Удаление рекламации (доступно сервисным организациям и менеджерам).",
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID рекламации",
                required=True,
                type=int
            )
        ],
        responses={
            204: None,
            401: OpenApiResponse(description="Не авторизован"),
            403: OpenApiResponse(description="Нет прав доступа"),
            404: OpenApiResponse(description="Рекламация не найдена")
        }
    )
)