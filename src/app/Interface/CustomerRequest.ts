import { ReportRequestType } from "../Enum/ReportRequestType.enum";
import { RequestStatus } from "../Enum/RequestStatus.enum";

// CustomerRequest interface
export interface CustomerRequest {
    requestId?: number;
    requestType: ReportRequestType;
    billId?: number;
    newValue?: string;
    extendDays?: number;
    details?: string;
    customerId?: number;
    requestDate?: string;
    status: RequestStatus;
  }