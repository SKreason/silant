from rest_framework import permissions


class ClientsPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        return request.user.type == 'MR'


class ServiceOrganizationPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method == 'GET':
            return True


class ReferenceDirectoryPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method == 'GET':
            return True

        return request.user.type == 'MR'


class VehiclePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
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
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
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
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
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


