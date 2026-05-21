import { copyrightLine } from '@/lib/brand';

export function Footer() {
  return (
    <div className="footer">
      <div>{copyrightLine()}</div>
    </div>
  );
}
