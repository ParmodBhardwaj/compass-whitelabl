import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SapService } from './sap.service';

/**
 * SAP Integration endpoints.
 * All routes require JWT authentication.
 */
@Controller('sap')
@UseGuards(AuthGuard('jwt'))
export class SapController {
  constructor(private readonly svc: SapService) {}

  /** Connectivity / health check */
  @Get('ping')
  ping() {
    return this.svc.ping();
  }

  /** List all SOAP operations exposed by the configured WSDL */
  @Get('operations')
  listOperations() {
    return this.svc.listOperations();
  }

  /**
   * Generic SOAP call — useful for admin diagnostics or modules not yet
   * given their own strongly-typed endpoint.
   * Body: { operation: string; args: Record<string,unknown> }
   */
  @Post('call')
  call(@Body() body: { operation: string; args: Record<string, unknown> }) {
    return this.svc.call(body.operation, body.args ?? {});
  }

  // ── Convenience endpoints for specific SAP operations ────────────────────

  @Get('employee/:id')
  getEmployee(@Param('id') id: string) {
    return this.svc.getEmployeeMaster(id);
  }

  @Get('leave/:employeeId')
  getLeaveBalance(
    @Param('employeeId') employeeId: string,
  ) {
    return this.svc.getLeaveBalance(employeeId);
  }

  @Post('maintenance-order')
  createMaintenanceOrder(
    @Body()
    body: {
      plantId: string;
      functionalLocation: string;
      description: string;
      priority?: string;
      requester?: string;
    },
  ) {
    return this.svc.createMaintenanceOrder(body);
  }

  @Post('production-data')
  getProductionData(
    @Body() body: { plant: string; line: string; shift: string; date: string },
  ) {
    return this.svc.getProductionData(body);
  }
}
