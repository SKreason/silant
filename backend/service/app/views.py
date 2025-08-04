
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import *
from .serializers import *


# Временные View для тестирования
# class VehicleList(generics.ListCreateAPIView):
#     queryset = Vehicle.objects.all()
#     serializer_class = VehicleSerializer
#
#
# class VehicleDetail(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Vehicle.objects.all()
#     serializer_class = VehicleSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CustomTokenRefresh(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer