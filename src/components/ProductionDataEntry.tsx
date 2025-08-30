import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Clock, 
  User, 
  Settings as SettingsIcon, 
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Layers,
  Droplets,
  Shirt
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { TypedMemoryInput } from './TypedMemoryInput';
import { 
  ProductionEntry, 
  KnittingProductionEntry, 
  DyeingProductionEntry, 
  GarmentsProductionEntry,
  SHIFTS,
  QUALITY_GRADES,
  FABRIC_TYPES,
  DYE_TYPES,
  YARN_TYPES,
  GARMENT_STYLES,
  GARMENT_SIZES,
  initialKnittingEntry,
  initialDyeingEntry,
  initialGarmentsEntry
} from '../types/production';
import * as Select from '@radix-ui/react-select';

interface ProductionDataEntryProps {
  productionType: 'knitting' | 'dyeing' | 'garments';
  onSave: (entry: Omit<ProductionEntry, 'id' | 'userId' | 'timestamp'>) => void;
  editingEntry?: ProductionEntry | null;
  onCancel?: () => void;
}

export const ProductionDataEntry: React.FC<ProductionDataEntryProps> = ({
  productionType,
  onSave,
  editingEntry,
  onCancel
}) => {
  const [formData, setFormData] = useState<any>(() => {
    if (editingEntry) return editingEntry;
    
    switch (productionType) {
      case 'knitting': return initialKnittingEntry;
      case 'dyeing': return initialDyeingEntry;
      case 'garments': return initialGarmentsEntry;
      default: return initialKnittingEntry;
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingEntry) {
      setFormData(editingEntry);
    }
  }, [editingEntry]);

  // Calculate efficiency and total hours automatically
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      // Handle overnight shifts
      if (hours < 0) {
        hours += 24;
      }
      
      setFormData((prev: any) => ({ ...prev, totalHours: Math.round(hours * 100) / 100 }));
    }

    // Calculate efficiency based on production type
    if (productionType === 'knitting' || productionType === 'garments') {
      if (formData.targetProduction > 0 || formData.targetQuantity > 0) {
        const target = formData.targetProduction || formData.targetQuantity;
        const actual = formData.actualProduction || formData.completedQuantity;
        const efficiency = target > 0 ? Math.round((actual / target) * 100) : 0;
        setFormData((prev: any) => ({ ...prev, efficiency }));
      }
    }
  }, [formData.startTime, formData.endTime, formData.targetProduction, formData.actualProduction, formData.targetQuantity, formData.completedQuantity, productionType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.operator?.trim()) newErrors.operator = 'Operator name is required';
    if (!formData.supervisor?.trim()) newErrors.supervisor = 'Supervisor name is required';
    if (!formData.machineNo?.trim()) newErrors.machineNo = 'Machine number is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    // Production type specific validations
    if (productionType === 'knitting') {
      if (!formData.fabricType?.trim()) newErrors.fabricType = 'Fabric type is required';
      if (!formData.yarnType?.trim()) newErrors.yarnType = 'Yarn type is required';
      if (formData.targetProduction <= 0) newErrors.targetProduction = 'Target production must be greater than 0';
    } else if (productionType === 'dyeing') {
      if (!formData.fabricType?.trim()) newErrors.fabricType = 'Fabric type is required';
      if (!formData.color?.trim()) newErrors.color = 'Color is required';
      if (!formData.dyeType?.trim()) newErrors.dyeType = 'Dye type is required';
      if (formData.batchWeight <= 0) newErrors.batchWeight = 'Batch weight must be greater than 0';
    } else if (productionType === 'garments') {
      if (!formData.style?.trim()) newErrors.style = 'Style is required';
      if (!formData.size?.trim()) newErrors.size = 'Size is required';
      if (formData.targetQuantity <= 0) newErrors.targetQuantity = 'Target quantity must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3";
  const labelClasses = "block text-sm font-medium text-foreground mb-1";
  const errorClasses = "text-red-500 text-xs mt-1";

  const getProductionIcon = () => {
    switch (productionType) {
      case 'knitting': return <Layers className="h-6 w-6 text-white" />;
      case 'dyeing': return <Droplets className="h-6 w-6 text-white" />;
      case 'garments': return <Shirt className="h-6 w-6 text-white" />;
    }
  };

  const getProductionColor = () => {
    switch (productionType) {
      case 'knitting': return 'from-blue-500 to-blue-600';
      case 'dyeing': return 'from-purple-500 to-purple-600';
      case 'garments': return 'from-green-500 to-green-600';
    }
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 bg-gradient-to-br ${getProductionColor()} rounded-xl`}>
          {getProductionIcon()}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground capitalize">
            {productionType} Production Entry
          </h2>
          <p className="text-muted-foreground">
            Record daily production data and track performance metrics
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-muted/20 p-6 rounded-xl border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClasses}>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={inputClasses}
              />
              {errors.date && <p className={errorClasses}>{errors.date}</p>}
            </div>
            <div>
              <label className={labelClasses}>Shift *</label>
              <Select.Root value={formData.shift} onValueChange={(value) => handleInputChange('shift', value)}>
                <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                  <Select.Value placeholder="Select Shift" />
                  <Select.Icon>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      {SHIFTS.map(shift => (
                        <Select.Item key={shift.value} value={shift.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>{shift.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            <div>
              <label className={labelClasses}>Machine No *</label>
              <TypedMemoryInput
                value={formData.machineNo}
                onChange={(e) => handleInputChange('machineNo', e.target.value)}
                className={inputClasses}
                storageKey={`${productionType}MachineNo`}
                placeholder="Machine Number"
              />
              {errors.machineNo && <p className={errorClasses}>{errors.machineNo}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className={labelClasses}>Operator *</label>
              <TypedMemoryInput
                value={formData.operator}
                onChange={(e) => handleInputChange('operator', e.target.value)}
                className={inputClasses}
                storageKey={`${productionType}Operator`}
                placeholder="Operator Name"
              />
              {errors.operator && <p className={errorClasses}>{errors.operator}</p>}
            </div>
            <div>
              <label className={labelClasses}>Supervisor *</label>
              <TypedMemoryInput
                value={formData.supervisor}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                className={inputClasses}
                storageKey={`${productionType}Supervisor`}
                placeholder="Supervisor Name"
              />
              {errors.supervisor && <p className={errorClasses}>{errors.supervisor}</p>}
            </div>
            <div>
              <label className={labelClasses}>Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={inputClasses}
              />
              {errors.startTime && <p className={errorClasses}>{errors.startTime}</p>}
            </div>
            <div>
              <label className={labelClasses}>End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={inputClasses}
              />
              {errors.endTime && <p className={errorClasses}>{errors.endTime}</p>}
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Total Hours:</span>
                <span className="text-lg font-bold text-primary">{formData.totalHours} hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Production Specific Fields */}
        {productionType === 'knitting' && (
          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200/50">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-blue-600" />
              Knitting Production Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Fabric Type *</label>
                <Select.Root value={formData.fabricType} onValueChange={(value) => handleInputChange('fabricType', value)}>
                  <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="Select Fabric" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1 max-h-48 overflow-y-auto">
                        {FABRIC_TYPES.map(fabric => (
                          <Select.Item key={fabric} value={fabric} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{fabric}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.fabricType && <p className={errorClasses}>{errors.fabricType}</p>}
              </div>
              <div>
                <label className={labelClasses}>Yarn Type *</label>
                <Select.Root value={formData.yarnType} onValueChange={(value) => handleInputChange('yarnType', value)}>
                  <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="Select Yarn" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1 max-h-48 overflow-y-auto">
                        {YARN_TYPES.map(yarn => (
                          <Select.Item key={yarn} value={yarn} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{yarn}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.yarnType && <p className={errorClasses}>{errors.yarnType}</p>}
              </div>
              <div>
                <label className={labelClasses}>Yarn Lot</label>
                <TypedMemoryInput
                  value={formData.yarnLot}
                  onChange={(e) => handleInputChange('yarnLot', e.target.value)}
                  className={inputClasses}
                  storageKey="knittingYarnLot"
                  placeholder="Yarn Lot Number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Gauge</label>
                <Input
                  value={formData.gauge}
                  onChange={(e) => handleInputChange('gauge', e.target.value)}
                  className={inputClasses}
                  placeholder="e.g., 28GG"
                />
              </div>
              <div>
                <label className={labelClasses}>GSM</label>
                <Input
                  type="number"
                  value={formData.gsm || ''}
                  onChange={(e) => handleInputChange('gsm', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="180"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Width (cm)</label>
                <Input
                  type="number"
                  value={formData.width || ''}
                  onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="180"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>RPM</label>
                <Input
                  type="number"
                  value={formData.rpm || ''}
                  onChange={(e) => handleInputChange('rpm', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="120"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Target Production (kg) *</label>
                <Input
                  type="number"
                  value={formData.targetProduction || ''}
                  onChange={(e) => handleInputChange('targetProduction', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="100"
                  min="0"
                />
                {errors.targetProduction && <p className={errorClasses}>{errors.targetProduction}</p>}
              </div>
              <div>
                <label className={labelClasses}>Actual Production (kg)</label>
                <Input
                  type="number"
                  value={formData.actualProduction || ''}
                  onChange={(e) => handleInputChange('actualProduction', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="95"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Efficiency (%)</label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    type="number"
                    value={formData.efficiency || ''}
                    readOnly
                    className="block w-full rounded-l-lg border border-border bg-muted/50 text-foreground/70 py-2 px-3"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-border bg-muted/50 text-muted-foreground text-sm font-medium">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Defects */}
            <div>
              <h4 className="text-md font-semibold text-foreground mb-3">Defects Count</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClasses}>Holes</label>
                  <Input
                    type="number"
                    value={formData.defects?.holes || ''}
                    onChange={(e) => handleNestedInputChange('defects', 'holes', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Drop Stitches</label>
                  <Input
                    type="number"
                    value={formData.defects?.dropStitches || ''}
                    onChange={(e) => handleNestedInputChange('defects', 'dropStitches', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Yarn Breaks</label>
                  <Input
                    type="number"
                    value={formData.defects?.yarnBreaks || ''}
                    onChange={(e) => handleNestedInputChange('defects', 'yarnBreaks', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Needle Breaks</label>
                  <Input
                    type="number"
                    value={formData.needleBreaks || ''}
                    onChange={(e) => handleInputChange('needleBreaks', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {productionType === 'dyeing' && (
          <div className="bg-purple-50/50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200/50">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-purple-600" />
              Dyeing Production Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Fabric Type *</label>
                <Select.Root value={formData.fabricType} onValueChange={(value) => handleInputChange('fabricType', value)}>
                  <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="Select Fabric" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1 max-h-48 overflow-y-auto">
                        {FABRIC_TYPES.map(fabric => (
                          <Select.Item key={fabric} value={fabric} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{fabric}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.fabricType && <p className={errorClasses}>{errors.fabricType}</p>}
              </div>
              <div>
                <label className={labelClasses}>Color *</label>
                <TypedMemoryInput
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className={inputClasses}
                  storageKey="dyeingColor"
                  placeholder="Color Name"
                />
                {errors.color && <p className={errorClasses}>{errors.color}</p>}
              </div>
              <div>
                <label className={labelClasses}>Dye Type *</label>
                <Select.Root value={formData.dyeType} onValueChange={(value) => handleInputChange('dyeType', value)}>
                  <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="Select Dye Type" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        {DYE_TYPES.map(dye => (
                          <Select.Item key={dye} value={dye} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{dye}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.dyeType && <p className={errorClasses}>{errors.dyeType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Batch Weight (kg) *</label>
                <Input
                  type="number"
                  value={formData.batchWeight || ''}
                  onChange={(e) => handleInputChange('batchWeight', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="100"
                  min="0"
                />
                {errors.batchWeight && <p className={errorClasses}>{errors.batchWeight}</p>}
              </div>
              <div>
                <label className={labelClasses}>Liquor Ratio</label>
                <Input
                  type="number"
                  value={formData.liquorRatio || ''}
                  onChange={(e) => handleInputChange('liquorRatio', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="1:10"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className={labelClasses}>Temperature (°C)</label>
                <Input
                  type="number"
                  value={formData.temperature || ''}
                  onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="60"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>pH Level</label>
                <Input
                  type="number"
                  value={formData.pH || ''}
                  onChange={(e) => handleInputChange('pH', parseFloat(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="7.0"
                  min="0"
                  max="14"
                  step="0.1"
                />
              </div>
            </div>

            {/* Chemical Consumption */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-foreground mb-3">Chemical Consumption (kg)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClasses}>Dyes</label>
                  <Input
                    type="number"
                    value={formData.chemicalConsumption?.dyes || ''}
                    onChange={(e) => handleNestedInputChange('chemicalConsumption', 'dyes', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Salt</label>
                  <Input
                    type="number"
                    value={formData.chemicalConsumption?.salt || ''}
                    onChange={(e) => handleNestedInputChange('chemicalConsumption', 'salt', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Soda</label>
                  <Input
                    type="number"
                    value={formData.chemicalConsumption?.soda || ''}
                    onChange={(e) => handleNestedInputChange('chemicalConsumption', 'soda', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Auxiliaries</label>
                  <Input
                    type="number"
                    value={formData.chemicalConsumption?.auxiliaries || ''}
                    onChange={(e) => handleNestedInputChange('chemicalConsumption', 'auxiliaries', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Quality Results */}
            <div>
              <h4 className="text-md font-semibold text-foreground mb-3">Quality Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClasses}>Color Match</label>
                  <Select.Root value={formData.qualityResults?.colorMatch} onValueChange={(value) => handleNestedInputChange('qualityResults', 'colorMatch', value)}>
                    <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                      <Select.Value placeholder="Select Rating" />
                      <Select.Icon>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                        <Select.Viewport className="p-1">
                          {['excellent', 'good', 'acceptable', 'poor'].map(rating => (
                            <Select.Item key={rating} value={rating} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                              <Select.ItemText className="capitalize">{rating}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <div>
                  <label className={labelClasses}>Fastness</label>
                  <Select.Root value={formData.qualityResults?.fastness} onValueChange={(value) => handleNestedInputChange('qualityResults', 'fastness', value)}>
                    <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                      <Select.Value placeholder="Select Rating" />
                      <Select.Icon>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                        <Select.Viewport className="p-1">
                          {['excellent', 'good', 'acceptable', 'poor'].map(rating => (
                            <Select.Item key={rating} value={rating} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                              <Select.ItemText className="capitalize">{rating}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <div>
                  <label className={labelClasses}>Uniformity</label>
                  <Select.Root value={formData.qualityResults?.uniformity} onValueChange={(value) => handleNestedInputChange('qualityResults', 'uniformity', value)}>
                    <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                      <Select.Value placeholder="Select Rating" />
                      <Select.Icon>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                        <Select.Viewport className="p-1">
                          {['excellent', 'good', 'acceptable', 'poor'].map(rating => (
                            <Select.Item key={rating} value={rating} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                              <Select.ItemText className="capitalize">{rating}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>
            </div>

            {/* Resource Consumption */}
            <div>
              <h4 className="text-md font-semibold text-foreground mb-3">Resource Consumption</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClasses}>Water (L)</label>
                  <Input
                    type="number"
                    value={formData.waterConsumption || ''}
                    onChange={(e) => handleInputChange('waterConsumption', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Energy (kWh)</label>
                  <Input
                    type="number"
                    value={formData.energyConsumption || ''}
                    onChange={(e) => handleInputChange('energyConsumption', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Waste Generated (kg)</label>
                  <Input
                    type="number"
                    value={formData.wasteGenerated || ''}
                    onChange={(e) => handleInputChange('wasteGenerated', parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {productionType === 'garments' && (
          <div className="bg-green-50/50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200/50">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Shirt className="h-5 w-5 mr-2 text-green-600" />
              Garments Production Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Style *</label>
                <Select.Root value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                  <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="Select Style" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1 max-h-48 overflow-y-auto">
                        {GARMENT_STYLES.map(style => (
                          <Select.Item key={style} value={style} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{style}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.style && <p className={errorClasses}>{errors.style}</p>}
              </div>
              <div>
                <label className={labelClasses}>Size *</label>
                <Select.Root value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                    <Select.Value placeholder="Select Size" />
                    <Select.Icon>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                      <Select.Viewport className="p-1">
                        {GARMENT_SIZES.map(size => (
                          <Select.Item key={size} value={size} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                            <Select.ItemText>{size}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {errors.size && <p className={errorClasses}>{errors.size}</p>}
              </div>
              <div>
                <label className={labelClasses}>Color</label>
                <TypedMemoryInput
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className={inputClasses}
                  storageKey="garmentsColor"
                  placeholder="Color Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelClasses}>Target Quantity *</label>
                <Input
                  type="number"
                  value={formData.targetQuantity || ''}
                  onChange={(e) => handleInputChange('targetQuantity', parseInt(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="100"
                  min="0"
                />
                {errors.targetQuantity && <p className={errorClasses}>{errors.targetQuantity}</p>}
              </div>
              <div>
                <label className={labelClasses}>Completed Quantity</label>
                <Input
                  type="number"
                  value={formData.completedQuantity || ''}
                  onChange={(e) => handleInputChange('completedQuantity', parseInt(e.target.value) || 0)}
                  className={inputClasses}
                  placeholder="95"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClasses}>Efficiency (%)</label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    type="number"
                    value={formData.efficiency || ''}
                    readOnly
                    className="block w-full rounded-l-lg border border-border bg-muted/50 text-foreground/70 py-2 px-3"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-border bg-muted/50 text-muted-foreground text-sm font-medium">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-foreground mb-3">Operations Completed</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClasses}>Cutting</label>
                  <Input
                    type="number"
                    value={formData.operations?.cutting || ''}
                    onChange={(e) => handleNestedInputChange('operations', 'cutting', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Sewing</label>
                  <Input
                    type="number"
                    value={formData.operations?.sewing || ''}
                    onChange={(e) => handleNestedInputChange('operations', 'sewing', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Finishing</label>
                  <Input
                    type="number"
                    value={formData.operations?.finishing || ''}
                    onChange={(e) => handleNestedInputChange('operations', 'finishing', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Packing</label>
                  <Input
                    type="number"
                    value={formData.operations?.packing || ''}
                    onChange={(e) => handleNestedInputChange('operations', 'packing', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Defects */}
            <div>
              <h4 className="text-md font-semibold text-foreground mb-3">Defects Count</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClasses}>Stitching Defects</label>
                  <Input
                    type="number"
                    value={formData.defects?.stitchingDefects || ''}
                    onChange={(e) => handleNestedInputChange('defects', 'stitchingDefects', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Measurement Defects</label>
                  <Input
                    type="number"
                    value={formData.defects?.measurementDefects || ''}
                    onChange={(e) => handleNestedInputChange('defects', 'measurementDefects', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Fabric Defects</label>
                  <Input
                    type="number"
                    value={formData.defects?.fabricDefects || ''}
                    onChange={(e) => handleNestedInputChange('defects', 'fabricDefects', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Rework</label>
                  <Input
                    type="number"
                    value={formData.rework || ''}
                    onChange={(e) => handleInputChange('rework', parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Grade and Notes */}
        <div className="bg-muted/20 p-6 rounded-xl border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Quality Grade</label>
              <Select.Root value={formData.qualityGrade} onValueChange={(value) => handleInputChange('qualityGrade', value)}>
                <Select.Trigger className="flex items-center justify-between w-full rounded-lg border border-border shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground py-2 px-3">
                  <Select.Value placeholder="Select Grade" />
                  <Select.Icon>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="overflow-hidden rounded-lg bg-card border border-border shadow-lg z-50">
                    <Select.Viewport className="p-1">
                      {QUALITY_GRADES.map(grade => (
                        <Select.Item key={grade.value} value={grade.value} className="relative flex items-center rounded-md py-2 pl-3 pr-9 text-foreground text-sm outline-none data-[highlighted]:bg-primary/20">
                          <Select.ItemText>{grade.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
            <div>
              <label className={labelClasses}>Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className={`${inputClasses} min-h-[80px]`}
                rows={3}
                placeholder="Additional notes or observations..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="h-4 w-4 mr-2" />
            {editingEntry ? 'Update Entry' : 'Save Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
};