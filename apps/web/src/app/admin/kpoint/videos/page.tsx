'use client';
import { MasterDataPanel } from '@/components/legacy/MasterDataPanel';

interface Video {
  id: number;
  [k: string]: any;
}

/**
 * /admin/kpoint/videos — auto-generated portal admin page.
 * Edit via tools/gen-admin-pages.mjs to keep config consistent.
 */
export default function VideoAdminPage() {
  return (
    <MasterDataPanel<Video>
      title="KPoint — Videos Catalog"
      entityName="Video"
      breadcrumb={[{'label':'Home','href':'/admin'},{'label':'KPoint'},{'label':'Videos'}]}
      apiPath="/kpoint-admin/videos"
      blank={{'videoLinkId':0,'type':'general','language':'en','videoLink':''}}
      searchableKeys={["videoLink"]}
      columns={[
        { header: 'Id', width: 60, cell: (r) => r.id },
        { header: 'Section ID', width: 100, cell: (r) => r.videoLinkId ?? r.video_link_id ?? "—" },
        { header: 'Type', width: 100, cell: (r) => r.type },
        { header: 'Lang', width: 80, cell: (r) => r.language },
        { header: 'Video Link', cell: (r) => <a href={r.videoLink} target='_blank' rel='noreferrer' style={{ color: '#1c84c6', fontSize: 12 }}>{(r.videoLink ?? '').slice(0,80)}</a> }
      ]}
      fields={[
        { name: 'videoLinkId', label: 'Section / Link ID', type: 'number', required: true },
        { name: 'type', label: 'Type', type: 'select', options: [{'value':'main','label':'Main'},{'value':'general','label':'General'},{'value':'special','label':'Special'},{'value':'important','label':'Important'}] },
        { name: 'language', label: 'Language', type: 'select', options: [{'value':'en','label':'English'},{'value':'hin','label':'Hindi'},{'value':'telugu','label':'Telugu'},{'value':'tamil','label':'Tamil'},{'value':'malam','label':'Malayalam'},{'value':'kanad','label':'Kannada'},{'value':'global','label':'Global'}] },
        { name: 'videoLink', label: 'Video URL', required: true, placeholder: 'https://www.kpoint.in/...' }
      ]}
    />
  );
}
