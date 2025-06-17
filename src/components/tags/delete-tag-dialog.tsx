'use client';

import { X, AlertTriangle, Trash2 } from 'lucide-react';

export interface TagData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  category: string;
  color: string;
  icon?: string;
  influencerCount: number;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface DeleteTagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
  tag: TagData | null;
}

export default function DeleteTagDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  tag
}: DeleteTagDialogProps) {
  if (!isOpen || !tag) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('删除标签失败:', error);
    }
  };

  const canDelete = !tag.isSystem;
  const hasInfluencers = tag.influencerCount > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* 背景遮罩 */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* 对话框 */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center justify-between">
                删除标签
                <button
                  type="button"
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </h3>
              
              <div className="mt-4">
                {/* 标签信息 */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{tag.displayName}</div>
                      <div className="text-sm text-gray-500">{tag.name}</div>
                      {tag.description && (
                        <div className="text-sm text-gray-600 mt-1">{tag.description}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 系统标签警告 */}
                {tag.isSystem && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          无法删除系统标签
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            这是一个系统标签，无法删除。系统标签是平台预设的重要分类标签，用于确保数据分类的一致性。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 使用情况警告 */}
                {hasInfluencers && canDelete && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-800">
                          标签正在使用中
                        </h3>
                        <div className="mt-2 text-sm text-orange-700">
                          <p>
                            当前有 <span className="font-medium">{tag.influencerCount}</span> 个达人使用了这个标签。
                            删除后，这些达人将失去该标签分类。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 删除影响说明 */}
                {canDelete && (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">删除此标签将会：</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>永久删除标签记录</li>
                      <li>移除所有达人身上的此标签</li>
                      <li>清除与此标签相关的筛选条件</li>
                      <li>影响基于此标签的数据统计</li>
                    </ul>
                    <p className="mt-3 font-medium text-red-600">
                      此操作不可撤销，请谨慎操作！
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            {canDelete ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      删除中...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      确认删除
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  取消
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 