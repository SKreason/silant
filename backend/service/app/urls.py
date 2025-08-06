from rest_framework.routers import DefaultRouter

from .views import ReferenceDirectoryViewSet, ClientsViewSet, ServiceOrganizationViewSet, VehicleViewSet, \
    MaintenanceViewSet, WarrantyClaimViewSet

router = DefaultRouter()
router.register('references', ReferenceDirectoryViewSet, basename='references')
router.register('clients', ClientsViewSet, basename='clients')
router.register('services', ServiceOrganizationViewSet, basename='services')
router.register('vehicles', VehicleViewSet, basename='vehicles')
router.register('maintenances', MaintenanceViewSet, basename='maintenances')
router.register('claims', WarrantyClaimViewSet, basename='claims')

urlpatterns = router.urls