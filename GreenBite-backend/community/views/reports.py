from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from community.models import CommunityReport
from community.serializers import (
    CommunityReportCreateSerializer, 
    ReportListSerializer, 
    ReportDetailSerializer, 
    ReportModerateSerializer
)
from community.services.report_service import ReportService
from community.permissions import IsAdminUser
from community.pagination import StandardPagination
from community.serializers.filters import ReportFilterSerializer

class CommunityReportView(APIView):
    """
    POST → create a report (user)
    GET  → view all reports (admin)
    """
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def post(self, request):
        """Create a new report"""
        serializer = CommunityReportCreateSerializer(
            data=request.data, 
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        
        report = ReportService.create_report(
            reporter=request.user,
            target_type=serializer.validated_data['target_type'],
            target_id=serializer.validated_data['target_id'],
            reason=serializer.validated_data['reason'],
            details=serializer.validated_data.get('details')
        )
        
        return Response(
            {
                "report_id": report.id, 
                "created_at": report.created_at
            },
            status=status.HTTP_201_CREATED
        )

    def get(self, request):
        """List all reports with filtering and pagination (admin only)"""
        queryset = CommunityReport.objects.all()
        
        # Apply filtering
        filter_serializer = ReportFilterSerializer(data=request.query_params)
        filter_serializer.is_valid(raise_exception=True)
        data = filter_serializer.validated_data

        if status := data.get("status"):
            queryset = queryset.filter(status=status)

        if target_type := data.get("target_type"):
            queryset = queryset.filter(target_type=target_type)
        
        # Apply pagination
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        serializer = ReportListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class CommunityReportDetailView(APIView):
    """
    GET   → view report details (admin)
    PATCH → moderate report (admin)
    """
    permission_classes = [IsAdminUser]

    def get_object(self, report_id):
        return get_object_or_404(CommunityReport, id=report_id)

    def get(self, request, report_id):
        """Get report details"""
        report = self.get_object(report_id)
        serializer = ReportDetailSerializer(report)
        return Response(serializer.data)

    def patch(self, request, report_id):
        """Moderate a report (approve/dismiss)"""
        report = self.get_object(report_id)
        
        serializer = ReportModerateSerializer(
            data=request.data,
            context={"report": report}
        )
        serializer.is_valid(raise_exception=True)
        
        try:
            ReportService.moderate_report(
                report=report,
                admin=request.user,
                data=serializer.validated_data
            )
        except (ValueError, ValidationError) as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {
                "report_id": report.id,
                "status": report.status,
                "reviewed_by": report.reviewed_by.id if report.reviewed_by else None,
                "reviewed_at": report.reviewed_at,
            },
            status=status.HTTP_200_OK,
        )