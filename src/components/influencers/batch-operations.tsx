'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tag, 
  Download, 
  Upload, 
  Trash2, 
  Loader2, 
  FileSpreadsheet, 
  FileText,
  AlertTriangle
} from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  displayName: string;
}

interface TagData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  category: string;
}

interface Influencer {
  id: string;
  username?: string;
  displayName?: string;
  platform: Platform;
  followersCount: number;
  status: string;
  tags?: TagData[];
}

interface BatchOperationsProps {
  selectedInfluencers: string[];
  influencers: Influencer[];
  tags: TagData[];
  onClose: () => void;
  onAddTags: (tagIds: string[]) => Promise<void>;
  onRemoveTags: (tagIds: string[]) => Promise<void>;
  onDelete: () => Promise<void>;
  onExport: (format: 'json' | 'csv') => Promise<void>;
  onImport: (file: File) => Promise<void>;
  loading: boolean;
}

export default function BatchOperations({
  selectedInfluencers,
  influencers,
  tags,
  onClose,
  onAddTags,
  onRemoveTags,
  onDelete,
  onExport,
  onImport,
  loading
}: BatchOperationsProps) {
  const [activeTab, setActiveTab] = useState<'tags' | 'export' | 'import' | 'delete'>('tags');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedInfluencerData = influencers.filter(inf => selectedInfluencers.includes(inf.id));
  
  const getCommonTags = () => {
    if (selectedInfluencerData.length === 0) return [];
    
    const firstInfluencerTagIds = selectedInfluencerData[0]?.tags?.map(t => t.id) || [];
    
    return firstInfluencerTagIds.filter(tagId =>
      selectedInfluencerData.every(influencer =>
        influencer.tags?.some(tag => tag.id === tagId)
      )
    );
  };

  const commonTags = getCommonTags();

  const handleAddTags = async () => {
    if (selectedTags.length > 0) {
      await onAddTags(selectedTags);
      setSelectedTags([]);
    }
  };

  const handleRemoveTags = async () => {
    if (selectedTags.length > 0) {
      await onRemoveTags(selectedTags);
      setSelectedTags([]);
    }
  };

  const handleFileImport = async () => {
    if (importFile) {
      await onImport(importFile);
      setImportFile(null);
    }
  };

  const handleDelete = async () => {
    await onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">批量操作</h2>
            <p className="text-sm text-gray-500 mt-1">
              已选择 {selectedInfluencers.length} 个达人
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Influencers Preview */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {selectedInfluencerData.slice(0, 10).map(influencer => (
              <div key={influencer.id} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm border">
                <span className="font-medium">{influencer.displayName || influencer.username}</span>
                <span className="text-gray-500">({influencer.platform.displayName})</span>
              </div>
            ))}
            {selectedInfluencerData.length > 10 && (
              <div className="px-3 py-1 bg-gray-200 rounded-full text-sm text-gray-600">
                +{selectedInfluencerData.length - 10} 更多
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'tags', label: '标签管理', icon: Tag },
            { key: 'export', label: '导出数据', icon: Download },
            { key: 'import', label: '导入数据', icon: Upload },
            { key: 'delete', label: '删除操作', icon: Trash2 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* 标签管理 */}
          {activeTab === 'tags' && (
            <div className="space-y-6">
              {/* 共同标签 */}
              {commonTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">共同标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.displayName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 添加标签 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">添加标签</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                      {tags.map(tag => (
                        <label key={tag.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTags(prev => [...prev, tag.id]);
                              } else {
                                setSelectedTags(prev => prev.filter(id => id !== tag.id));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                          >
                            {tag.displayName}
                          </span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={handleAddTags}
                      disabled={loading || selectedTags.length === 0}
                      className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                      添加选中标签
                    </button>
                  </div>
                  
                  {/* 移除标签 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">移除标签</h4>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3">
                      {commonTags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <label key={tag.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTags(prev => [...prev, tag.id]);
                                } else {
                                  setSelectedTags(prev => prev.filter(id => id !== tag.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.displayName}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleRemoveTags}
                      disabled={loading || selectedTags.length === 0}
                      className="w-full mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      移除选中标签
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 导出数据 */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">导出选中的达人数据</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onExport('csv')}
                  disabled={loading}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="font-medium">CSV 格式</div>
                      <div className="text-sm text-gray-500">适合 Excel 打开</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onExport('json')}
                  disabled={loading}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-medium">JSON 格式</div>
                      <div className="text-sm text-gray-500">完整数据结构</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 导入数据 */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">批量导入达人数据</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    选择文件
                  </label>
                </div>
                {importFile && (
                  <div className="text-sm text-gray-600 mb-4">
                    已选择: {importFile.name}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  支持 CSV 和 JSON 格式文件
                </div>
              </div>
              {importFile && (
                <button
                  onClick={handleFileImport}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  开始导入
                </button>
              )}
            </div>
          )}

          {/* 删除操作 */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">危险操作</h3>
                  <p className="text-sm text-red-600 mt-1">
                    您即将删除 {selectedInfluencers.length} 个达人的所有数据，此操作不可恢复。
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showDeleteConfirm}
                    onChange={(e) => setShowDeleteConfirm(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    我确认要删除这些达人数据
                  </span>
                </label>
              </div>
              
              <button
                onClick={handleDelete}
                disabled={loading || !showDeleteConfirm}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                确认删除
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 