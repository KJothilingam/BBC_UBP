import { ReportRequestType } from "../Enum/ReportRequestType.enum";
import { RequestStatus } from "../Enum/RequestStatus.enum";

export interface ReportRequest {
    requestId?: number;
    requestType: ReportRequestType;
    status: RequestStatus;
    details?: string;
    billId?: number;
    customerId: number;
    requestDate?: string;
  }
  