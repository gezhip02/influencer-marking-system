import { NextRequest, NextResponse } from 'next/server';
import { FulfillmentStatusManager } from '@/lib/fulfillment-status-manager';
import { 
  FulfillmentStatus, 
  StatusChangeReason,
  StatusTransitionRequest 
} from '@/types/fulfillment';
import prisma from '@/lib/prisma';
import { serializeBigInt } from '@/lib/bigint-serializer';
import { generateId } from '@/lib/snowflake';

// PUT /api/fulfillment-records/[id]/status - 更新履约单状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recordId = BigInt(id);
    const body = await request.json();

    // 验证必需字段
    if (!body.currentStatus) {
      return NextResponse.json(
        { success: false, error: '目标状态不能为空' },
        { status: 400 }
      );
    }

    // 检查履约单是否存在
    const existingRecord = await prisma.fulfillmentRecord.findFirst({
      where: { 
        id: recordId,
        status: 1 
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: '履约单不存在' },
        { status: 404 }
      );
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // 更新履约单状态
    const updatedRecord = await prisma.fulfillmentRecord.update({
      where: { id: recordId },
      data: { 
        currentStatus: body.currentStatus,
        currentStageStartTime: currentTime,
        // 根据状态设置截止时间（简化版本）
        currentStageDeadline: body.currentStageDeadline ? body.currentStageDeadline : currentTime + 24 * 3600, // 默认24小时后
        isCurrentStageOverdue: false,
        updatedAt: currentTime
      }
    });

    // 创建状态变更日志
    await prisma.fulfillmentStatusLog.create({
      data: {
        id: generateId(), // 使用雪花算法生成ID
        fulfillmentRecordId: recordId,
        fromStatus: existingRecord.currentStatus,
        toStatus: body.currentStatus,
        stageStartTime: currentTime,
        stageEndTime: currentTime,
        stageDeadline: currentTime + 24 * 3600,
        actualDurationHours: 0,
        isOverdue: false,
        changeReason: 'manual_update',
        remarks: body.remarks || '',
        operatorId: body.operatorId ? BigInt(body.operatorId) : BigInt('1001'),
        status: 1,
        createdAt: currentTime
      }
    });

    const serializedRecord = serializeBigInt(updatedRecord);

    return NextResponse.json({
      success: true,
      data: serializedRecord,
      message: '状态更新成功'
    });

  } catch (error) {
    console.error('更新履约单状态失败:', error);
    return NextResponse.json(
      { success: false, error: '更新履约单状态失败' },
      { status: 500 }
    );
  }
}

// GET /api/fulfillment-records/[id]/status - 获取状态信息和可转换状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '履约单ID不能为空' },
        { status: 400 }
      );
    }

    // 模拟获取当前状态信息
    const currentStatus = FulfillmentStatus.PENDING_SAMPLE;
    const nextPossibleStatuses = FulfillmentStatusManager.getNextPossibleStatuses(currentStatus);
    const currentSLA = FulfillmentStatusManager.getDefaultSLA(currentStatus);
    const isFinalStatus = FulfillmentStatusManager.isFinalStatus(currentStatus);

    return NextResponse.json({
      success: true,
      data: {
        fulfillmentRecord: {
          id: id,
          currentStatus: currentStatus,
          currentStatusDisplayName: FulfillmentStatusManager.getStatusDisplayName(currentStatus),
          currentStageStartTime: Math.floor(Date.now() / 1000) - 7200, // 2小时前
          currentStageDeadline: Math.floor(Date.now() / 1000) + 79200, // 22小时后
          isCurrentStageOverdue: false,
          isFinalStatus: isFinalStatus
        },
        statusFlow: {
          currentStatus: currentStatus,
          nextPossibleStatuses: nextPossibleStatuses.map(status => ({
            status: status,
            displayName: FulfillmentStatusManager.getStatusDisplayName(status),
            validation: FulfillmentStatusManager.validateTransition(currentStatus, status)
          })),
          allStatuses: Object.values(FulfillmentStatus).map(status => ({
            status: status,
            displayName: FulfillmentStatusManager.getStatusDisplayName(status),
            isFinal: FulfillmentStatusManager.isFinalStatus(status),
            defaultSLA: FulfillmentStatusManager.getDefaultSLA(status)
          }))
        },
        timeline: {
          currentSLA: currentSLA,
          remainingHours: Math.round((Math.floor(Date.now() / 1000) + 79200 - Math.floor(Date.now() / 1000)) / 3600),
          isApproachingDeadline: false,
          isOverdue: false
        }
      }
    });

  } catch (error) {
    console.error('获取状态信息失败:', error);
    return NextResponse.json(
      { success: false, error: '获取状态信息失败' },
      { status: 500 }
    );
  }
} 