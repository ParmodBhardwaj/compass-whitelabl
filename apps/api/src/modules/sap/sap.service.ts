import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initSap, callSap, getSapClient } from '@hero/integrations/src/sap';

/**
 * SAP Integration — Wave 4 module.
 *
 * Wraps the `@hero/integrations` SAP SOAP client. On startup the service
 * reads SAP_WSDL_URL / SAP_USERNAME / SAP_PASSWORD from the environment and
 * calls initSap().  Callers should catch ServiceUnavailableException when SAP
 * is not yet configured (env vars absent) and handle gracefully.
 *
 * Specific high-level methods are added here as Hero modules need them;
 * the generic `call(operation, args)` provides an escape hatch.
 */
@Injectable()
export class SapService {
  private readonly logger = new Logger(SapService.name);
  private readonly configured: boolean;

  constructor(private readonly config: ConfigService) {
    const wsdlUrl = config.get<string>('SAP_WSDL_URL', '');
    if (wsdlUrl) {
      initSap({
        wsdlUrl,
        username: config.get<string>('SAP_USERNAME'),
        password: config.get<string>('SAP_PASSWORD'),
      });
      this.configured = true;
      this.logger.log(`SAP integration configured (WSDL: ${wsdlUrl})`);
    } else {
      this.configured = false;
      this.logger.warn('SAP_WSDL_URL not set — SAP integration disabled');
    }
  }

  /** Generic SOAP call. Throws ServiceUnavailableException if not configured. */
  async call<T = any>(operation: string, args: Record<string, unknown>): Promise<T> {
    this.assertConfigured();
    try {
      return await callSap<T>(operation, args);
    } catch (err: any) {
      this.logger.error(`SAP call [${operation}] failed: ${err?.message}`);
      throw err;
    }
  }

  /** Returns list of available SOAP operations from the WSDL. */
  async listOperations(): Promise<string[]> {
    this.assertConfigured();
    const client = await getSapClient();
    return Object.keys((client as any).describe?.() ?? {});
  }

  /** Connectivity check — resolves the client without calling any operation. */
  async ping(): Promise<{ ok: boolean; message: string }> {
    if (!this.configured) return { ok: false, message: 'SAP_WSDL_URL not configured' };
    try {
      await getSapClient();
      return { ok: true, message: 'SAP SOAP client ready' };
    } catch (err: any) {
      return { ok: false, message: err?.message ?? 'Connection failed' };
    }
  }

  // ── Specific helpers used by Hero portal modules ──────────────────────────

  /**
   * Get employee master data from SAP HR.
   * Operation name may differ once real WSDL is supplied.
   */
  async getEmployeeMaster(employeeId: string) {
    return this.call('GetEmployeeMaster', { EmployeeId: employeeId });
  }

  /**
   * Sync leave balance for an employee.
   */
  async getLeaveBalance(employeeId: string, leaveType?: string) {
    return this.call('GetLeaveBalance', {
      EmployeeId: employeeId,
      LeaveType: leaveType ?? 'ALL',
    });
  }

  /**
   * Push MP-Sheet / Maintenance request to SAP PM.
   */
  async createMaintenanceOrder(data: {
    plantId: string;
    functionalLocation: string;
    description: string;
    priority?: string;
    requester?: string;
  }) {
    return this.call('CreateMaintenanceOrder', {
      Plant: data.plantId,
      FunctionalLocation: data.functionalLocation,
      Description: data.description,
      Priority: data.priority ?? '3',
      Requester: data.requester,
    });
  }

  /**
   * Fetch OEE / production data from SAP MII.
   */
  async getProductionData(params: {
    plant: string;
    line: string;
    shift: string;
    date: string;
  }) {
    return this.call('GetProductionData', {
      Plant: params.plant,
      Line: params.line,
      Shift: params.shift,
      Date: params.date,
    });
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw new ServiceUnavailableException(
        'SAP integration is not configured. Set SAP_WSDL_URL, SAP_USERNAME, SAP_PASSWORD env vars.',
      );
    }
  }
}
