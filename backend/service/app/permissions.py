"""
Модуль с кастомными классами разрешений для API.

Определяет права доступа для различных ролей пользователей:
- MR (Менеджер) - полный доступ
- CL (Клиент) - ограниченный доступ к своим данным
- SO (Сервисная организация) - доступ к связанным объектам
"""

from rest_framework import permissions


class ClientsPermission(permissions.BasePermission):
    """
    Разрешения для работы с клиентами.

    Доступ только для менеджеров (MR).
    """

    def has_permission(self, request, view):
        """
                Проверяет, имеет ли пользователь права на выполнение запроса.

                Args:
                    request: Запрос
                    view: Представление

                Returns:
                    bool: True если пользователь аутентифицирован и является менеджером (MR)
                """
        if not request.user.is_authenticated:
            return False

        return request.user.type == 'MR'


class ServiceOrganizationPermission(permissions.BasePermission):
    """
        Разрешения для работы с сервисными организациями.

        Доступ:
        - GET: для всех аутентифицированных пользователей
        - Остальные методы: только для менеджеров (MR)
        """
    def has_permission(self, request, view):
        """
        Проверяет права доступа в зависимости от метода запроса.

        Args:
            request: Запрос
            view: Представление

        Returns:
            bool: True если:
                  - запрос GET и пользователь аутентифицирован
                  - пользователь менеджер (MR)
        """
        if not request.user.is_authenticated:
            return False

        if request.method == 'GET':
            return True


class ReferenceDirectoryPermission(permissions.BasePermission):
    """
    Разрешения для работы со справочниками.

    Доступ:
    - GET: для всех аутентифицированных пользователей
    - Остальные методы: только для менеджеров (MR)
    """

    def has_permission(self, request, view):
        """
        Проверяет права доступа к справочникам.

        Args:
            request: Запрос
            view: Представление

        Returns:
            bool: True если:
                  - запрос GET и пользователь аутентифицирован
                  - пользователь менеджер (MR)
        """
        if not request.user.is_authenticated:
            return False

        if request.method == 'GET':
            return True

        return request.user.type == 'MR'


class VehiclePermission(permissions.BasePermission):
    """
    Разрешения для работы с техникой.

    Доступ:
    - GET: для всех пользователей (включая неаутентифицированных)
    - Остальные методы: только для аутентифицированных пользователей

    Детальные проверки для объектов:
    - MR: полный доступ
    - CL: доступ только к своей технике (чтение)
    - SO: доступ только к технике своей сервисной организации (чтение)
    """

    def has_permission(self, request, view):
        """
        Проверяет общие права доступа к списку техники.

        Args:
            request: Запрос
            view: Представление

        Returns:
            bool: True если:
                  - запрос GET
                  - пользователь аутентифицирован (для не-GET запросов)
        """
        if request.method == 'GET':
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Проверяет права доступа к конкретному объекту техники.

        Args:
            request: Запрос
            view: Представление
            obj: Объект техники

        Returns:
            bool: True если:
                  - запрос GET и пользователь не аутентифицирован
                  - пользователь менеджер (MR)
                  - пользователь клиент (CL) и техника принадлежит ему
                  - пользователь сервисная организация (SO) и техника приписана к ней
        """
        if not request.user.is_authenticated:
            return request.method == 'GET'

        if request.user.type == 'MR':
            return True

        if request.user.type == 'CL':
            return (
                request.method == 'GET' and obj.client == request.user
            )

        if request.user.type == 'SO':
            return (
                request.method == 'GET' and obj.service == request.user
            )

        return False


class MaintenancePermission(permissions.BasePermission):
    """
    Разрешения для работы с записями ТО (технического обслуживания).

    Доступ:
    - Только для аутентифицированных пользователей

    Детальные проверки для объектов:
    - MR: полный доступ
    - CL: доступ только к ТО своей техники
    - SO: доступ только к ТО техники своей сервисной организации
    """
    def has_permission(self, request, view):
        """
        Проверяет общие права доступа к списку ТО.

        Args:
            request: Запрос
            view: Представление

        Returns:
            bool: True если пользователь аутентифицирован
        """
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Проверяет права доступа к конкретной записи ТО.

        Args:
            request: Запрос
            view: Представление
            obj: Объект ТО

        Returns:
            bool: True если:
                  - пользователь менеджер (MR)
                  - пользователь клиент (CL) и ТО относится к его технике
                  - пользователь сервисная организация (SO) и ТО относится к технике его организации
        """
        user = request.user

        if user.type == 'MR':
            return True

        if user.type == 'CL':
            if request.method in ['GET', 'POST', 'PUT', 'DELETE']:
                return obj.vehicle.client == user
            return False

        if user.type == 'SO':
            if request.method in ['GET', 'POST', 'PUT', 'DELETE']:
                return obj.vehicle.service == user
            return False

        return False


class WarrantyClaimPermission(permissions.BasePermission):
    """
    Разрешения для работы с рекламациями.

    Доступ:
    - Только для аутентифицированных пользователей

    Детальные проверки для объектов:
    - MR: полный доступ
    - CL: доступ только на чтение своих рекламаций
    - SO: полный доступ к рекламациям по своей технике
    """

    def has_permission(self, request, view):
        """
        Проверяет общие права доступа к списку рекламаций.

        Args:
            request: Запрос
            view: Представление

        Returns:
            bool: True если пользователь аутентифицирован
        """
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Проверяет права доступа к конкретной рекламации.

        Args:
            request: Запрос
            view: Представление
            obj: Объект рекламации

        Returns:
            bool: True если:
                  - пользователь менеджер (MR)
                  - пользователь клиент (CL) и запрос GET для его рекламации
                  - пользователь сервисная организация (SO) и рекламация относится к технике его организации
        """
        user = request.user

        if user.type == 'MR':
            return True

        if user.type == 'CL':
            return request.method == 'GET' and obj.vehicle.client == user

        if user.type == 'SO':
            if request.method in ['GET', 'POST', 'PUT', 'DELETE']:
                return obj.vehicle.service == user
            return False

        return False


