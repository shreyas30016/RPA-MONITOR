import type { RPARow } from '../types/rpa.types';

export type InspectorSection = {
  id: string;
  label: string;
  icon: string;
  fields: Array<keyof RPARow>;
};

export const INSPECTOR_SECTIONS: InspectorSection[] = [
  {
    id: 'general',
    label: 'General Information',
    icon: 'info',
    fields: ['project_name', 'project_id', 'company_id', 'department', 'industry', 'country']
  },
  {
    id: 'automation',
    label: 'Automation Details',
    icon: 'precision_manufacturing',
    fields: ['automation_type', 'ai_enabled', 'cloud_deployment', 'implementation_partner']
  },
  {
    id: 'financial',
    label: 'Financial Metrics',
    icon: 'monetization_on',
    fields: ['budget_usd', 'annual_savings_usd', 'roi_percent']
  },
  {
    id: 'performance',
    label: 'Performance & Deployment',
    icon: 'speed',
    fields: ['robots_deployed', 'employee_hours_saved', 'start_date', 'completion_date']
  }
];