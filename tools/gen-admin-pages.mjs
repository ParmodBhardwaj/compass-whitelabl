// One-off generator for the 22 portal admin pages. Each page is a thin
// MasterDataPanel config wrapper — DRY beats inline copy-paste.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(
  'D:/Vibe/Compass/HeroErpMigrate8.2NewZone/hero-compass/apps/web/src/app/admin',
);

const STATUS_BADGE_CELL = `(r) => (
            <span style={{
              background: r.status === '1' ? '#1ab394' : '#ed5565',
              color: '#fff', borderRadius: 10, padding: '2px 10px',
              fontSize: 11, fontWeight: 700,
            }}>
              {r.status === '1' ? 'Enable' : 'Disable'}
            </span>
          )`;

const STATUS_FIELD = {
  name: 'status', label: 'Status', type: 'select',
  options: [{ value: '1', label: 'Enable' }, { value: '0', label: 'Disable' }],
};

const NAME_STRONG = (col) => `(r) => <span style={{ fontWeight: 600 }}>{r.${col}}</span>`;
const SHORT_DESC = (col) =>
  `(r) => <span style={{ fontSize: 12, color: '#666' }}>{(r.${col} ?? '').slice(0, 100)}</span>`;

function buildPage({ dir, title, entity, breadcrumb, apiPath, columns, fields, blank, search }) {
  // Strip non-alphanumeric chars from entity name so it makes a valid TS identifier
  // (e.g. "Sub-Category" → "SubCategory", "CC User" → "CCUser").
  const iface = entity.replace(/[^a-zA-Z0-9]/g, '');
  const cols = columns.map(c =>
    `        { header: '${c.header}', ${c.width ? `width: ${c.width}, ` : ''}cell: ${c.cell} }`
  ).join(',\n');
  const flds = fields.map(f => {
    const lines = [];
    lines.push(`name: '${f.name}'`);
    lines.push(`label: '${f.label.replace(/'/g, "\\'")}'`);
    if (f.type) lines.push(`type: '${f.type}'`);
    if (f.required) lines.push('required: true');
    if (f.placeholder) lines.push(`placeholder: '${f.placeholder}'`);
    if (f.options) lines.push(`options: ${JSON.stringify(f.options).replace(/"/g, "'")}`);
    return `        { ${lines.join(', ')} }`;
  }).join(',\n');

  const code = `'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface ${iface} {
  id: number;
  [k: string]: any;
}

/**
 * /admin/${dir} — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function ${iface}AdminPage() {
  return (
    <MasterDataPanel<${iface}>
      title="${title}"
      entityName="${entity}"
      breadcrumb={${JSON.stringify(breadcrumb).replace(/"/g, "'")}}
      apiPath="${apiPath}"
      blank={${JSON.stringify(blank).replace(/"/g, "'")}}
      searchableKeys={${JSON.stringify(search)}}
      columns={[
${cols}
      ]}
      fields={[
${flds}
      ]}
    />
  );
}
`;
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true });
  fs.writeFileSync(path.join(ROOT, dir, 'page.tsx'), code);
  console.log('Wrote', dir);
}

const pages = [
  { dir: 'cp/locations', title: 'Car Pool — Office Locations', entity: 'Location',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Car Pool'},{label:'Locations'}],
    apiPath: '/cp/locations', blank: {city:'', area:'', sortOrder:0}, search: ['city','area'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'City', cell: NAME_STRONG('city') },
      { header: 'Area', cell: '(r) => r.area' },
      { header: 'Sort', width: 80, cell: '(r) => r.sortOrder ?? 0' },
    ],
    fields: [
      { name: 'city', label: 'City', required: true },
      { name: 'area', label: 'Area', required: true },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
  },
  { dir: 'sale-rent/categories', title: 'Sale/Rent Categories', entity: 'Category',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Sale/Rent'},{label:'Categories'}],
    apiPath: '/sale/categories', blank: {title:'', sort:0, status:'1'}, search: ['title'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Title', cell: NAME_STRONG('title') },
      { header: 'Sort', width: 80, cell: '(r) => r.sort ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'sort', label: 'Sort Order', type: 'number' },
      STATUS_FIELD,
    ],
  },
  { dir: 'idea/content', title: 'Idea Banner Content', entity: 'Content',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Idea Portal'},{label:'Content'}],
    apiPath: '/idea/content', blank: {title:'', description:'', status:'1'}, search: ['title'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Title', cell: NAME_STRONG('title') },
      { header: 'Description', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      STATUS_FIELD,
    ],
  },
  { dir: 'rnd/notices', title: 'R&D Notice Board', entity: 'Notice',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'R&D'},{label:'Notice Board'}],
    apiPath: '/rnd/notices', blank: {description:'', status:'1'}, search: ['description'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Notice', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'description', label: 'Notice text', type: 'textarea', required: true },
      STATUS_FIELD,
    ],
  },
  { dir: 'rnd/joinees', title: 'R&D — New Joiners', entity: 'Joiner',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'R&D'},{label:'New Joiners'}],
    apiPath: '/rnd/joinees', blank: {name:'', designation:'', description:'', image:'', status:'1', storeId:6, type:''},
    search: ['name','designation'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Name', cell: NAME_STRONG('name') },
      { header: 'Designation', cell: '(r) => r.designation' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'designation', label: 'Designation' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image filename' },
      STATUS_FIELD,
    ],
  },
  { dir: 'rnd/competitor-products', title: 'R&D — Competitor Products', entity: 'Product',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'R&D'},{label:'Product Launch'}],
    apiPath: '/rnd/competitor-products', blank: {name:'', price:0, description:'', image:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Name', cell: NAME_STRONG('name') },
      { header: 'Price', width: 100, cell: `(r) => <span style={{ color: '#e2231a', fontWeight: 700 }}>₹{r.price}</span>` },
      { header: 'Description', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Product Name', required: true },
      { name: 'price', label: 'Price (INR)', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image filename' },
      STATUS_FIELD,
    ],
  },
];

// D&I — 5 same-shaped pages
for (const kind of ['events', 'newsletters', 'initiatives', 'videos', 'featured']) {
  const labels = { events: 'Events', newsletters: 'Newsletters', initiatives: 'Initiatives', videos: 'Videos', featured: 'Featured Stories' };
  const nameField = (kind === 'events' || kind === 'featured') ? 'title' : 'name';
  pages.push({
    dir: `dni/${kind}`,
    title: `D&I — ${labels[kind]}`,
    entity: labels[kind].replace(/s$/, ''),
    breadcrumb: [{label:'Home',href:'/admin'},{label:'D&I'},{label:labels[kind]}],
    apiPath: `/dni/${kind}`,
    blank: { [nameField]: '', shortDescription: '', description: '', image: '', sortOrder: 0, status: '1', isFeatured: '0' },
    search: [nameField, 'shortDescription'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Title', cell: NAME_STRONG(nameField) },
      { header: 'Short Description', cell: SHORT_DESC('shortDescription') },
      { header: 'Sort', width: 80, cell: '(r) => r.sortOrder ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: nameField, label: 'Title', required: true },
      { name: 'shortDescription', label: 'Short Description' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'image', label: 'Image filename' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      STATUS_FIELD,
    ],
  });
}

// Quality Alert
pages.push(
  { dir: 'qa/subdepartments', title: 'Quality Alert — Sub Departments', entity: 'Sub Department',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Quality Alert'},{label:'Sub Departments'}],
    apiPath: '/qa/subdepartments', blank: {name:'', departmentId:0, status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Name', cell: NAME_STRONG('name') },
      { header: 'Dept ID', width: 100, cell: '(r) => r.departmentId ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number' },
      STATUS_FIELD,
    ],
  },
  { dir: 'qa/initiators', title: 'Quality Alert — Initiators', entity: 'Initiator',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Quality Alert'},{label:'Initiators'}],
    apiPath: '/qa/initiators', blank: {userId:0, departmentId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
      { header: 'Department ID', cell: '(r) => r.departmentId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number' },
    ],
  },
  { dir: 'qa/fi-users', title: 'Quality Alert — CC Users', entity: 'CC User',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Quality Alert'},{label:'CC Users'}],
    apiPath: '/qa/fi-users', blank: {userId:0, departmentId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
      { header: 'Department ID', cell: '(r) => r.departmentId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number' },
    ],
  },
);

// OEE master tables
for (const [dir, title, entity, fld] of [
  ['oee/lines',         'OEE — Lines',           'Line',          'Line Name'],
  ['oee/groups',        'OEE — Groups',          'Group',         'Group Name'],
  ['oee/loss-categories','OEE — Loss Categories','Loss Category', 'Loss Category Name'],
  ['oee/bottlenecks',   'OEE — Bottlenecks',     'Bottleneck',    'Bottleneck Name'],
  ['oee/departments',   'OEE — Departments',     'Department',    'Department Name'],
]) {
  pages.push({
    dir, title, entity,
    breadcrumb: [{label:'Home',href:'/admin'},{label:'OEE'},{label:title.split('—')[1].trim()}],
    apiPath: `/${dir}`, blank: {name:'', status:'1'}, search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: fld, cell: NAME_STRONG('name') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: fld, required: true },
      STATUS_FIELD,
    ],
  });
}

pages.push(
  { dir: 'oee/machines', title: 'OEE — Machines', entity: 'Machine',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'OEE'},{label:'Machines'}],
    apiPath: '/oee/machines', blank: {name:'', lineId:0, status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Machine Name', cell: NAME_STRONG('name') },
      { header: 'Line ID', width: 100, cell: '(r) => r.lineId ?? "—"' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Machine Name', required: true },
      { name: 'lineId', label: 'Line ID', type: 'number' },
      STATUS_FIELD,
    ],
  },
  { dir: 'oee/holidays', title: 'OEE — Holidays', entity: 'Holiday',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'OEE'},{label:'Holidays'}],
    apiPath: '/oee/holidays', blank: {holidayDate:'', name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Date', width: 140, cell: '(r) => r.holidayDate' },
      { header: 'Holiday Name', cell: '(r) => r.name' },
    ],
    fields: [
      { name: 'holidayDate', label: 'Date', placeholder: 'YYYY-MM-DD', required: true },
      { name: 'name', label: 'Holiday Name', required: true },
    ],
  },
);

pages.push(
  { dir: 'audit/teams', title: 'Audit — Internal Teams', entity: 'Team',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Audit Tracker'},{label:'Internal Teams'}],
    apiPath: '/audit-tracker/teams', blank: {name:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Team Name', cell: NAME_STRONG('name') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Team Name', required: true },
      STATUS_FIELD,
    ],
  },
  { dir: 'audit/cutoff-dates', title: 'Audit — Cutoff Dates', entity: 'Cutoff',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Audit Tracker'},{label:'Cutoff Dates'}],
    apiPath: '/audit-tracker/cutoff-dates', blank: {cutoffDate:'', description:''},
    search: ['description'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Cutoff Date', width: 140, cell: '(r) => r.cutoffDate' },
      { header: 'Description', cell: '(r) => r.description' },
    ],
    fields: [
      { name: 'cutoffDate', label: 'Cutoff Date', placeholder: 'YYYY-MM-DD', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
);

// ── TPM masters ─────────────────────────────────────────────────────
// Simple "name + sort + status" pattern used by most hazard/sub-cat tables.
const STATUS_BADGE_TPM = STATUS_BADGE_CELL;
const SIMPLE_STATUS_FIELDS = (label) => [
  { name: 'title', label, required: true },
  { name: 'sort', label: 'Sort Order', type: 'number' },
  STATUS_FIELD,
];

pages.push(
  // hazard_category (id, hazard_id, title, sort, status)
  { dir: 'tpm/hazard-categories', title: 'TPM — Hazard Categories', entity: 'Category',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Hazard'},{label:'Category'}],
    apiPath: '/tpm-master/hazard-categories', blank: {hazardId:0, title:'', sort:0, status:'1'},
    search: ['title'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Hazard ID', width: 100, cell: '(r) => r.hazardId ?? r.hazard_id ?? "—"' },
      { header: 'Title', cell: NAME_STRONG('title') },
      { header: 'Sort', width: 80, cell: '(r) => r.sort ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_TPM },
    ],
    fields: [
      { name: 'hazardId', label: 'Hazard ID', type: 'number' },
      { name: 'title', label: 'Title', required: true },
      { name: 'sort', label: 'Sort', type: 'number' },
      STATUS_FIELD,
    ],
  },
  // hazard_sub_category (parent_id, title, sort, status)
  { dir: 'tpm/hazard-sub-categories', title: 'TPM — Hazard Sub-Categories', entity: 'Sub-Category',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Hazard'},{label:'Sub Category'}],
    apiPath: '/tpm-master/hazard-sub-categories', blank: {parentId:0, title:'', sort:0, status:'1'},
    search: ['title'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Parent', width: 100, cell: '(r) => r.parentId ?? r.parent_id ?? "—"' },
      { header: 'Title', cell: NAME_STRONG('title') },
      { header: 'Sort', width: 80, cell: '(r) => r.sort ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_TPM },
    ],
    fields: [
      { name: 'parentId', label: 'Parent Category ID', type: 'number', required: true },
      { name: 'title', label: 'Title', required: true },
      { name: 'sort', label: 'Sort', type: 'number' },
      STATUS_FIELD,
    ],
  },
  // hazard_audit_type (id, name)
  { dir: 'tpm/hazard-types', title: 'TPM — Hazard Types', entity: 'Type',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Hazard Type'}],
    apiPath: '/tpm-master/hazard-types', blank: {name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Name', cell: NAME_STRONG('name') },
    ],
    fields: [
      { name: 'name', label: 'Hazard Type Name', required: true },
    ],
  },
  // injury_reason (id, name, description, status, is_deleted)
  { dir: 'tpm/injury-reasons', title: 'TPM — Injury Reasons', entity: 'Reason',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Injury Reason'}],
    apiPath: '/tpm-master/injury-reasons', blank: {name:'', description:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Reason', cell: NAME_STRONG('name') },
      { header: 'Description', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_TPM },
    ],
    fields: [
      { name: 'name', label: 'Reason', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      STATUS_FIELD,
    ],
  },
  // injured_body_part (id, ...)
  { dir: 'tpm/injured-body-parts', title: 'TPM — Injured Body Parts', entity: 'Body Part',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Injured Body'}],
    apiPath: '/tpm-master/injured-body-parts', blank: {name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Body Part', cell: NAME_STRONG('name') },
    ],
    fields: [
      { name: 'name', label: 'Body Part Name', required: true },
    ],
  },
  // injured_sub_body_part
  { dir: 'tpm/injured-sub-body-parts', title: 'TPM — Injured Sub-Body Parts', entity: 'Sub-Body Part',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Injured Sub Body'}],
    apiPath: '/tpm-master/injured-sub-body-parts', blank: {name:'', bodyPartId:0},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Body Part ID', width: 110, cell: '(r) => r.bodyPartId ?? r.body_part_id ?? "—"' },
      { header: 'Sub-Body Part', cell: NAME_STRONG('name') },
    ],
    fields: [
      { name: 'bodyPartId', label: 'Parent Body Part ID', type: 'number' },
      { name: 'name', label: 'Sub-Body Part Name', required: true },
    ],
  },
  // kaizen_pillar (name, plant_name, sort_order, pillar_head, pillar_head_ecode, status, is_deleted)
  { dir: 'tpm/kaizen/pillars', title: 'TPM — KaiZen Pillars', entity: 'Pillar',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Pillar'}],
    apiPath: '/tpm-master/kaizen-pillars', blank: {name:'', plantName:'', sortOrder:0, pillarHead:0, pillarHeadEcode:'', status:'1'},
    search: ['name','plantName'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Pillar Name', cell: NAME_STRONG('name') },
      { header: 'Plant', cell: '(r) => r.plantName ?? r.plant_name' },
      { header: 'Head Ecode', width: 130, cell: '(r) => r.pillarHeadEcode ?? r.pillar_head_ecode ?? "—"' },
      { header: 'Sort', width: 70, cell: '(r) => r.sortOrder ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_TPM },
    ],
    fields: [
      { name: 'name', label: 'Pillar Name', required: true },
      { name: 'plantName', label: 'Plant Name' },
      { name: 'pillarHead', label: 'Pillar Head (User ID)', type: 'number' },
      { name: 'pillarHeadEcode', label: 'Pillar Head Ecode' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      STATUS_FIELD,
    ],
  },
  // kaizen_loss (name, loss_number, sort_order, status, is_deleted)
  { dir: 'tpm/kaizen/losses', title: 'TPM — KaiZen Losses', entity: 'Loss',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Losses'}],
    apiPath: '/tpm-master/kaizen-losses', blank: {name:'', lossNumber:'', sortOrder:0, status:'1'},
    search: ['name','lossNumber'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Loss #', width: 100, cell: '(r) => r.lossNumber ?? r.loss_number' },
      { header: 'Loss Name', cell: NAME_STRONG('name') },
      { header: 'Sort', width: 70, cell: '(r) => r.sortOrder ?? 0' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_TPM },
    ],
    fields: [
      { name: 'name', label: 'Loss Name', required: true },
      { name: 'lossNumber', label: 'Loss Number' },
      { name: 'sortOrder', label: 'Sort Order', type: 'number' },
      STATUS_FIELD,
    ],
  },
  // kaizen_machine
  { dir: 'tpm/kaizen/machines', title: 'TPM — KaiZen Machines', entity: 'Machine',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Machine'}],
    apiPath: '/tpm-master/kaizen-machines', blank: {name:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Machine', cell: NAME_STRONG('name') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_TPM },
    ],
    fields: [
      { name: 'name', label: 'Machine Name', required: true },
      STATUS_FIELD,
    ],
  },
  { dir: 'tpm/kaizen/sections', title: 'TPM — KaiZen Team Leader Sections', entity: 'Section',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Section'}],
    apiPath: '/tpm-master/kaizen-sections', blank: {name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Section', cell: NAME_STRONG('name') },
    ],
    fields: [{ name: 'name', label: 'Section Name', required: true }],
  },
  { dir: 'tpm/kaizen/plants', title: 'TPM — KaiZen Departments', entity: 'Plant',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Department'}],
    apiPath: '/tpm-master/kaizen-plants', blank: {name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Department', cell: NAME_STRONG('name') },
    ],
    fields: [{ name: 'name', label: 'Department Name', required: true }],
  },
  { dir: 'tpm/equipment-types', title: 'TPM — Tag/Equipment Types', entity: 'Type',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Tag Type'}],
    apiPath: '/tpm-master/ks-equipment-types', blank: {name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Equipment Type', cell: NAME_STRONG('name') },
    ],
    fields: [{ name: 'name', label: 'Type Name', required: true }],
  },
  { dir: 'tpm/kaizen/uoms', title: 'TPM — KaiZen Unit of Measurement', entity: 'UoM',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'UoM'}],
    apiPath: '/tpm-master/ks-uoms', blank: {name:''},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Unit', cell: NAME_STRONG('name') },
    ],
    fields: [{ name: 'name', label: 'Unit of Measurement', required: true }],
  },
  // tpm_master_plant
  { dir: 'tpm/plants', title: 'TPM — Master Plants', entity: 'Plant',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Master Plant'}],
    apiPath: '/tpm-master/plants', blank: {plantName:'', plantCode:'', manufacturerHead:'', plantHead:'', departmentHead:'', plantLocationId:0},
    search: ['plantName','plantCode'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Plant Name', cell: '(r) => <span style={{ fontWeight: 600 }}>{r.plantName ?? r.plant_name}</span>' },
      { header: 'Code', cell: '(r) => <code style={{ fontSize: 12 }}>{r.plantCode ?? r.plant_code}</code>' },
      { header: 'Plant Head', cell: '(r) => r.plantHead ?? r.plant_head ?? "—"' },
    ],
    fields: [
      { name: 'plantName',         label: 'Plant Name', required: true },
      { name: 'plantCode',         label: 'Plant Code', required: true },
      { name: 'manufacturerHead',  label: 'Manufacturer Head' },
      { name: 'plantHead',         label: 'Plant Head' },
      { name: 'departmentHead',    label: 'Department Head' },
      { name: 'plantLocationId',   label: 'Plant Location ID', type: 'number' },
    ],
  },
  // tpm_escalation
  { dir: 'tpm/escalations', title: 'TPM — Escalation Matrix', entity: 'Escalation',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Escalation Matrix'}],
    apiPath: '/tpm-master/escalations', blank: {days:0, role:'', notifyUserId:0},
    search: ['role'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Days', width: 80, cell: '(r) => r.days ?? 0' },
      { header: 'Role', cell: '(r) => r.role ?? "—"' },
      { header: 'Notify User ID', width: 140, cell: '(r) => r.notifyUserId ?? r.notify_user_id ?? "—"' },
    ],
    fields: [
      { name: 'days', label: 'Trigger after N days', type: 'number', required: true },
      { name: 'role', label: 'Role to notify' },
      { name: 'notifyUserId', label: 'Notify User ID', type: 'number' },
    ],
  },
);

// ── Visitor masters ─────────────────────────────────────────────────
const VISITOR_NAME_ONLY = (dir, title, label) => ({
  dir, title, entity: label,
  breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label}],
  apiPath: `/visitor-master/${dir.split('/').slice(1).join('/')}`,
  blank: { name:'', status:'1' }, search: ['name'],
  columns: [
    { header: 'Id', width: 60, cell: '(r) => r.id' },
    { header: label, cell: NAME_STRONG('name') },
    { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
  ],
  fields: [
    { name: 'name', label: `${label} Name`, required: true },
    STATUS_FIELD,
  ],
});

pages.push(
  // visitor_locations
  { dir: 'visitors/locations', title: 'Visitors — Locations', entity: 'Location',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Locations'}],
    apiPath: '/visitor-master/locations',
    blank: {name:'', locationCode:'', status:'1'},
    search: ['name','locationCode'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Location', cell: NAME_STRONG('name') },
      { header: 'Code', cell: '(r) => <code style={{ fontSize: 12 }}>{r.locationCode ?? r.location_code}</code>' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Location Name', required: true },
      { name: 'locationCode', label: 'Location Code' },
      STATUS_FIELD,
    ],
  },
  // visitor_instructions
  { dir: 'visitors/instructions', title: 'Visitors — Instructions', entity: 'Instruction',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Instructions'}],
    apiPath: '/visitor-master/instructions',
    blank: {title:'', description:'', status:'1'},
    search: ['title'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Title', cell: NAME_STRONG('title') },
      { header: 'Instruction', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Instruction text', type: 'textarea' },
      STATUS_FIELD,
    ],
  },
  // visitor_approval_members (id, user_id, location_id)
  { dir: 'visitors/approval-members', title: 'Visitors — Approval Members', entity: 'Member',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Approval Members'}],
    apiPath: '/visitor-master/approval-members',
    blank: {userId:0, locationId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId ?? r.user_id' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'locationId', label: 'Location ID', type: 'number' },
    ],
  },
  { dir: 'visitors/disabled-fields', title: 'Visitors — Disabled Fields', entity: 'Field',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Disabled Fields'}],
    apiPath: '/visitor-master/disabled-fields',
    blank: {fieldName:'', locationId:0},
    search: ['fieldName'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Field Name', cell: '(r) => r.fieldName ?? r.field_name' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
    ],
    fields: [
      { name: 'fieldName', label: 'Field Name', required: true },
      { name: 'locationId', label: 'Location ID', type: 'number' },
    ],
  },
  { dir: 'visitors/security-members', title: 'Visitors — Security Members', entity: 'Member',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Security Members'}],
    apiPath: '/visitor-master/security-members',
    blank: {userId:0, locationId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId ?? r.user_id' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'locationId', label: 'Location ID', type: 'number' },
    ],
  },
  { dir: 'visitors/canteen-members', title: 'Visitors — Canteen Members', entity: 'Member',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Canteen Members'}],
    apiPath: '/visitor-master/canteen-members',
    blank: {userId:0, locationId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId ?? r.user_id' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'locationId', label: 'Location ID', type: 'number' },
    ],
  },
  { dir: 'visitors/reception-members', title: 'Visitors — Reception Members', entity: 'Member',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Reception Members'}],
    apiPath: '/visitor-master/reception-members',
    blank: {userId:0, locationId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId ?? r.user_id' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'locationId', label: 'Location ID', type: 'number' },
    ],
  },
  { dir: 'visitors/feedback-locations', title: 'Visitors — Feedback Locations / Departments', entity: 'Location',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Feedback Location Department'}],
    apiPath: '/visitor-master/feedback-locations',
    blank: {locationId:0, departmentId:0},
    search: ['locationId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
      { header: 'Department ID', cell: '(r) => r.departmentId ?? r.department_id' },
    ],
    fields: [
      { name: 'locationId', label: 'Location ID', type: 'number', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'number' },
    ],
  },
  { dir: 'visitors/feedback-questions', title: 'Visitors — Feedback Questions', entity: 'Question',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Feedback Questions'}],
    apiPath: '/visitor-master/feedback-questions',
    blank: {question:'', type:'rating', status:'1'},
    search: ['question'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Question', cell: '(r) => <span style={{ fontWeight: 600 }}>{r.question}</span>' },
      { header: 'Type', width: 100, cell: '(r) => r.type' },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'question', label: 'Question', required: true },
      { name: 'type', label: 'Type', placeholder: 'rating | text | choice' },
      STATUS_FIELD,
    ],
  },
  { dir: 'visitors/pass-types', title: 'Visitors — Pass Types', entity: 'Pass Type',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Pass Types'}],
    apiPath: '/visitor-master/passes',
    blank: {name:'', locationCode:'', passDay:'single', requiredApproval:'yes', maxDaysAllowed:1},
    search: ['name','locationCode'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Pass Type', cell: NAME_STRONG('name') },
      { header: 'Code', cell: '(r) => <code style={{ fontSize: 12 }}>{r.locationCode ?? r.location_code}</code>' },
      { header: 'Days', width: 100, cell: '(r) => r.passDay ?? r.pass_day' },
      { header: 'Max Days', width: 100, cell: '(r) => r.maxDaysAllowed ?? r.max_days_allowed' },
      { header: 'Approval', width: 100, cell: '(r) => r.requiredApproval ?? r.required_approval' },
    ],
    fields: [
      { name: 'name', label: 'Pass Type Name', required: true },
      { name: 'locationCode', label: 'Location Code' },
      { name: 'passDay', label: 'Pass Duration', type: 'select',
        options: [{value:'single', label:'Single Day'},{value:'mutiple', label:'Multiple Days'}] },
      { name: 'requiredApproval', label: 'Approval Required', type: 'select',
        options: [{value:'yes', label:'Yes'},{value:'no', label:'No'}] },
      { name: 'maxDaysAllowed', label: 'Max Days Allowed', type: 'number' },
    ],
  },
  { dir: 'visitors/grades', title: 'Visitors — Grades for Red Pass', entity: 'Grade',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'Visitors'},{label:'Grades'}],
    apiPath: '/visitor-master/grades',
    blank: {locationId:0, grade:''},
    search: ['grade'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Location ID', cell: '(r) => r.locationId ?? r.location_id' },
      { header: 'Grade', cell: '(r) => r.grade' },
    ],
    fields: [
      { name: 'locationId', label: 'Location ID', type: 'number', required: true },
      { name: 'grade', label: 'Grade', required: true },
    ],
  },
);

// ── Final missing pages — TPM officers, classifications, themes, non-staff,
//    OEE extras, KPoint videos master, audit/QA reports ─────────────────
pages.push(
  // KPoint Videos — single CRUD that handles every legacy /kpoint/<section> URL
  { dir: 'kpoint/videos', title: 'KPoint — Videos Catalog', entity: 'Video',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'KPoint'},{label:'Videos'}],
    apiPath: '/kpoint-admin/videos',
    blank: {videoLinkId:0, type:'general', language:'en', videoLink:''},
    search: ['videoLink'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Section ID', width: 100, cell: '(r) => r.videoLinkId ?? r.video_link_id ?? "—"' },
      { header: 'Type', width: 100, cell: '(r) => r.type' },
      { header: 'Lang', width: 80, cell: '(r) => r.language' },
      { header: 'Video Link', cell: "(r) => <a href={r.videoLink} target='_blank' rel='noreferrer' style={{ color: '#1c84c6', fontSize: 12 }}>{(r.videoLink ?? '').slice(0,80)}</a>" },
    ],
    fields: [
      { name: 'videoLinkId', label: 'Section / Link ID', type: 'number', required: true },
      { name: 'type', label: 'Type', type: 'select',
        options: [{value:'main',label:'Main'},{value:'general',label:'General'},{value:'special',label:'Special'},{value:'important',label:'Important'}] },
      { name: 'language', label: 'Language', type: 'select',
        options: [
          {value:'en',label:'English'},{value:'hin',label:'Hindi'},
          {value:'telugu',label:'Telugu'},{value:'tamil',label:'Tamil'},
          {value:'malam',label:'Malayalam'},{value:'kanad',label:'Kannada'},
          {value:'global',label:'Global'},
        ] },
      { name: 'videoLink', label: 'Video URL', required: true, placeholder: 'https://www.kpoint.in/...' },
    ],
  },
  // TPM Officers (filter by type via query)
  { dir: 'tpm/safety-officers', title: 'TPM — Safety Officers', entity: 'Officer',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Safety Officers'}],
    apiPath: '/tpm-master/officers?type=safety',
    blank: {userId:0, type:'safety', plantId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
      { header: 'Plant ID', cell: '(r) => r.plantId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'plantId', label: 'Plant ID', type: 'number', required: true },
      { name: 'type', label: 'Officer Type', type: 'select', required: true,
        options: [{value:'safety',label:'Safety'}] },
    ],
  },
  { dir: 'tpm/medical-officers', title: 'TPM — Medical Officers', entity: 'Officer',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Medical Officers'}],
    apiPath: '/tpm-master/officers?type=medical',
    blank: {userId:0, type:'medical', plantId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
      { header: 'Plant ID', cell: '(r) => r.plantId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'plantId', label: 'Plant ID', type: 'number', required: true },
      { name: 'type', label: 'Officer Type', type: 'select', required: true,
        options: [{value:'medical',label:'Medical'}] },
    ],
  },
  { dir: 'tpm/hr-officers', title: 'TPM — HR Officers', entity: 'Officer',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'HR Officers'}],
    apiPath: '/tpm-master/officers?type=hr',
    blank: {userId:0, type:'hr', plantId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
      { header: 'Plant ID', cell: '(r) => r.plantId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
      { name: 'plantId', label: 'Plant ID', type: 'number', required: true },
      { name: 'type', label: 'Officer Type', type: 'select', required: true,
        options: [{value:'hr',label:'HR'}] },
    ],
  },
  // TPM Classifications
  { dir: 'tpm/classifications', title: 'TPM — Classifications', entity: 'Classification',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Classifications'}],
    apiPath: '/tpm-master/classifications',
    blank: {name:'', description:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Name', cell: NAME_STRONG('name') },
      { header: 'Description', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Classification Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      STATUS_FIELD,
    ],
  },
  // TPM Themes
  { dir: 'tpm/kaizen/themes', title: 'TPM — KaiZen Themes', entity: 'Theme',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Theme'}],
    apiPath: '/tpm-master/themes',
    blank: {name:'', description:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Theme Name', cell: NAME_STRONG('name') },
      { header: 'Description', cell: SHORT_DESC('description') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Theme Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      STATUS_FIELD,
    ],
  },
  // TPM Opex Team
  { dir: 'tpm/opex-team', title: 'TPM — Opex Team Members', entity: 'Member',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Opex Team'}],
    apiPath: '/tpm-master/opex-team',
    blank: {userId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId ?? r.user_id' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
    ],
  },
  // TPM Non-Staff
  { dir: 'tpm/non-staff', title: 'TPM — Non-Staff Master', entity: 'Employee',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'Non Staff'}],
    apiPath: '/tpm-master/non-staff',
    blank: {employeeName:'', ecNo:'', departmentName:'', sectionName:'', employeeType:'', designation:''},
    search: ['employeeName','ecNo','departmentName'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'EC No', width: 90, cell: '(r) => r.ecNo ?? r.ec_no' },
      { header: 'Name', cell: '(r) => <span style={{ fontWeight: 600 }}>{r.employeeName ?? r.employee_name}</span>' },
      { header: 'Department', cell: '(r) => r.departmentName ?? r.department_name' },
      { header: 'Section', cell: '(r) => r.sectionName ?? r.section_name' },
      { header: 'Designation', cell: '(r) => r.designation' },
    ],
    fields: [
      { name: 'employeeName', label: 'Employee Name', required: true },
      { name: 'ecNo', label: 'EC Number', required: true },
      { name: 'departmentName', label: 'Department' },
      { name: 'sectionName', label: 'Section' },
      { name: 'designation', label: 'Designation' },
      { name: 'employeeType', label: 'Employee Type' },
    ],
  },
  // TPM topics (reuses opl_topic via themes API) - keep simple alias
  { dir: 'tpm/kaizen/topics', title: 'TPM — KaiZen Topics', entity: 'Topic',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Topic'}],
    apiPath: '/tpm-master/themes', // shares theme service for now
    blank: {name:'', description:'', status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Topic', cell: NAME_STRONG('name') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Topic Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      STATUS_FIELD,
    ],
  },
  // TPM KaiZen Benefits — reuse losses table fields
  { dir: 'tpm/kaizen/benefits', title: 'TPM — KaiZen Benefit Types', entity: 'Benefit',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'TPM'},{label:'KaiZen'},{label:'Benefit'}],
    apiPath: '/tpm-master/kaizen-losses', // legacy stores benefits in same loss table
    blank: {name:'', lossNumber:'BEN', sortOrder:0, status:'1'},
    search: ['name'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'Benefit', cell: NAME_STRONG('name') },
      { header: 'Status', width: 100, cell: STATUS_BADGE_CELL },
    ],
    fields: [
      { name: 'name', label: 'Benefit Name', required: true },
      STATUS_FIELD,
    ],
  },
  // OEE extras
  { dir: 'oee/business-excellence', title: 'OEE — Business Excellence', entity: 'Member',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'OEE'},{label:'Business Excellence'}],
    apiPath: '/oee-extras/business-excellence',
    blank: {userId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
    ],
  },
  { dir: 'oee/mfg-coordinators', title: 'OEE — Mfg Coordinators', entity: 'Coordinator',
    breadcrumb: [{label:'Home',href:'/admin'},{label:'OEE'},{label:'Mfg Coordinators'}],
    apiPath: '/oee-extras/mfg-coordinators',
    blank: {userId:0},
    search: ['userId'],
    columns: [
      { header: 'Id', width: 60, cell: '(r) => r.id' },
      { header: 'User ID', cell: '(r) => r.userId' },
    ],
    fields: [
      { name: 'userId', label: 'User ID', type: 'number', required: true },
    ],
  },
);

pages.forEach(buildPage);
console.log(`\nDone. ${pages.length} pages written.`);
