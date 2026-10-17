import { t as errorResponse } from "./api.js";
import postgres from "@prisma/orm-postgres/runtime";
import "temporal-polyfill/global";
import node from "@prisma/composer/node";
import { compute } from "@prisma/composer-prisma-cloud";
import { dataContract, postgres as postgres$1 } from "@prisma/composer-prisma-cloud/orm";
//#region src/lib/server/auth.ts
var ROLE_QUAN_LY = "QUAN_LY";
function unauthenticated() {
	return errorResponse(401, "UNAUTHENTICATED", "Vui lòng đăng nhập");
}
function forbiddenRole() {
	return errorResponse(403, "FORBIDDEN_ROLE", "Bạn không có quyền thực hiện thao tác này");
}
var contract_default = {
	schemaVersion: "1",
	targetFamily: "sql",
	target: "postgres",
	profileHash: "3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2",
	roots: {
		"customer": {
			"model": "Customer",
			"namespace": "public"
		},
		"device": {
			"model": "Device",
			"namespace": "public"
		},
		"employee": {
			"model": "Employee",
			"namespace": "public"
		},
		"issue_category": {
			"model": "IssueCategory",
			"namespace": "public"
		},
		"ticket": {
			"model": "Ticket",
			"namespace": "public"
		},
		"ticket_status_log": {
			"model": "TicketStatusLog",
			"namespace": "public"
		}
	},
	domain: { "namespaces": { "public": { "models": {
		"Customer": {
			"fields": {
				"address": {
					"nullable": true,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 255 }
					}
				},
				"customerId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"fullName": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 120 }
					}
				},
				"isActive": {
					"nullable": false,
					"type": {
						"codecId": "pg/bool@1",
						"kind": "scalar"
					}
				},
				"phone": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				}
			},
			"relations": {
				"devices": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["customerId"],
						"targetFields": ["customerId"]
					},
					"to": {
						"model": "Device",
						"namespace": "public"
					}
				},
				"tickets": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["customerId"],
						"targetFields": ["customerId"]
					},
					"to": {
						"model": "Ticket",
						"namespace": "public"
					}
				}
			},
			"storage": {
				"fields": {
					"address": { "column": "address" },
					"customerId": { "column": "customer_id" },
					"fullName": { "column": "full_name" },
					"isActive": { "column": "is_active" },
					"phone": { "column": "phone" }
				},
				"namespaceId": "public",
				"table": "customer"
			}
		},
		"Device": {
			"fields": {
				"customerId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"deviceId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"isActive": {
					"nullable": false,
					"type": {
						"codecId": "pg/bool@1",
						"kind": "scalar"
					}
				},
				"isExternal": {
					"nullable": false,
					"type": {
						"codecId": "pg/bool@1",
						"kind": "scalar"
					}
				},
				"originNote": {
					"nullable": true,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 200 }
					}
				},
				"purchaseDate": {
					"nullable": true,
					"type": {
						"codecId": "pg/date-string@1",
						"kind": "scalar"
					}
				},
				"serialNo": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 50 }
					}
				},
				"warrantyMonths": {
					"nullable": false,
					"type": {
						"codecId": "pg/int2@1",
						"kind": "scalar"
					}
				}
			},
			"relations": {
				"customer": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["customerId"],
						"targetFields": ["customerId"]
					},
					"to": {
						"model": "Customer",
						"namespace": "public"
					}
				},
				"tickets": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["deviceId"],
						"targetFields": ["deviceId"]
					},
					"to": {
						"model": "Ticket",
						"namespace": "public"
					}
				}
			},
			"storage": {
				"fields": {
					"customerId": { "column": "customer_id" },
					"deviceId": { "column": "device_id" },
					"isActive": { "column": "is_active" },
					"isExternal": { "column": "is_external" },
					"originNote": { "column": "origin_note" },
					"purchaseDate": { "column": "purchase_date" },
					"serialNo": { "column": "serial_no" },
					"warrantyMonths": { "column": "warranty_months" }
				},
				"namespaceId": "public",
				"table": "device"
			}
		},
		"Employee": {
			"fields": {
				"centerCode": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				},
				"employeeId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"fullName": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 120 }
					}
				},
				"role": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				}
			},
			"relations": {
				"createdTickets": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["employeeId"],
						"targetFields": ["createdBy"]
					},
					"to": {
						"model": "Ticket",
						"namespace": "public"
					}
				},
				"statusChanges": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["employeeId"],
						"targetFields": ["changedBy"]
					},
					"to": {
						"model": "TicketStatusLog",
						"namespace": "public"
					}
				},
				"verifiedTickets": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["employeeId"],
						"targetFields": ["verifiedBy"]
					},
					"to": {
						"model": "Ticket",
						"namespace": "public"
					}
				}
			},
			"storage": {
				"fields": {
					"centerCode": { "column": "center_code" },
					"employeeId": { "column": "employee_id" },
					"fullName": { "column": "full_name" },
					"role": { "column": "role" }
				},
				"namespaceId": "public",
				"table": "employee"
			}
		},
		"IssueCategory": {
			"fields": {
				"categoryId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int4@1",
						"kind": "scalar"
					}
				},
				"categoryName": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 60 }
					}
				},
				"defaultPriority": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 10 }
					}
				}
			},
			"relations": { "tickets": {
				"cardinality": "1:N",
				"on": {
					"localFields": ["categoryId"],
					"targetFields": ["categoryId"]
				},
				"to": {
					"model": "Ticket",
					"namespace": "public"
				}
			} },
			"storage": {
				"fields": {
					"categoryId": { "column": "category_id" },
					"categoryName": { "column": "category_name" },
					"defaultPriority": { "column": "default_priority" }
				},
				"namespaceId": "public",
				"table": "issue_category"
			}
		},
		"Ticket": {
			"fields": {
				"categoryId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int4@1",
						"kind": "scalar"
					}
				},
				"centerCode": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				},
				"createdBy": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"customerId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"deviceId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"dueDate": {
					"nullable": false,
					"type": {
						"codecId": "pg/timestamptz-string@1",
						"kind": "scalar"
					}
				},
				"isWarranty": {
					"nullable": true,
					"type": {
						"codecId": "pg/bool@1",
						"kind": "scalar"
					}
				},
				"issueDesc": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 2e3 }
					}
				},
				"priority": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 10 }
					}
				},
				"receivedAt": {
					"nullable": false,
					"type": {
						"codecId": "pg/timestamptz-string@1",
						"kind": "scalar"
					}
				},
				"rejectReason": {
					"nullable": true,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 300 }
					}
				},
				"status": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				},
				"ticketCode": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				},
				"ticketId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"verifiedAt": {
					"nullable": true,
					"type": {
						"codecId": "pg/timestamptz-string@1",
						"kind": "scalar"
					}
				},
				"verifiedBy": {
					"nullable": true,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				}
			},
			"relations": {
				"category": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["categoryId"],
						"targetFields": ["categoryId"]
					},
					"to": {
						"model": "IssueCategory",
						"namespace": "public"
					}
				},
				"createdByEmployee": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["createdBy"],
						"targetFields": ["employeeId"]
					},
					"to": {
						"model": "Employee",
						"namespace": "public"
					}
				},
				"customer": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["customerId"],
						"targetFields": ["customerId"]
					},
					"to": {
						"model": "Customer",
						"namespace": "public"
					}
				},
				"device": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["deviceId"],
						"targetFields": ["deviceId"]
					},
					"to": {
						"model": "Device",
						"namespace": "public"
					}
				},
				"statusLogs": {
					"cardinality": "1:N",
					"on": {
						"localFields": ["ticketId"],
						"targetFields": ["ticketId"]
					},
					"to": {
						"model": "TicketStatusLog",
						"namespace": "public"
					}
				},
				"verifiedByEmployee": {
					"cardinality": "N:1",
					"nullable": true,
					"on": {
						"localFields": ["verifiedBy"],
						"targetFields": ["employeeId"]
					},
					"to": {
						"model": "Employee",
						"namespace": "public"
					}
				}
			},
			"storage": {
				"fields": {
					"categoryId": { "column": "category_id" },
					"centerCode": { "column": "center_code" },
					"createdBy": { "column": "created_by" },
					"customerId": { "column": "customer_id" },
					"deviceId": { "column": "device_id" },
					"dueDate": { "column": "due_date" },
					"isWarranty": { "column": "is_warranty" },
					"issueDesc": { "column": "issue_desc" },
					"priority": { "column": "priority" },
					"receivedAt": { "column": "received_at" },
					"rejectReason": { "column": "reject_reason" },
					"status": { "column": "status" },
					"ticketCode": { "column": "ticket_code" },
					"ticketId": { "column": "ticket_id" },
					"verifiedAt": { "column": "verified_at" },
					"verifiedBy": { "column": "verified_by" }
				},
				"namespaceId": "public",
				"table": "ticket"
			}
		},
		"TicketStatusLog": {
			"fields": {
				"changedAt": {
					"nullable": false,
					"type": {
						"codecId": "pg/timestamptz-string@1",
						"kind": "scalar"
					}
				},
				"changedBy": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"fromStatus": {
					"nullable": true,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				},
				"logId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"note": {
					"nullable": true,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 255 }
					}
				},
				"ticketId": {
					"nullable": false,
					"type": {
						"codecId": "pg/int8@1",
						"kind": "scalar"
					}
				},
				"toStatus": {
					"nullable": false,
					"type": {
						"codecId": "sql/varchar@1",
						"kind": "scalar",
						"typeParams": { "length": 20 }
					}
				}
			},
			"relations": {
				"changedByEmployee": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["changedBy"],
						"targetFields": ["employeeId"]
					},
					"to": {
						"model": "Employee",
						"namespace": "public"
					}
				},
				"ticket": {
					"cardinality": "N:1",
					"nullable": false,
					"on": {
						"localFields": ["ticketId"],
						"targetFields": ["ticketId"]
					},
					"to": {
						"model": "Ticket",
						"namespace": "public"
					}
				}
			},
			"storage": {
				"fields": {
					"changedAt": { "column": "changed_at" },
					"changedBy": { "column": "changed_by" },
					"fromStatus": { "column": "from_status" },
					"logId": { "column": "log_id" },
					"note": { "column": "note" },
					"ticketId": { "column": "ticket_id" },
					"toStatus": { "column": "to_status" }
				},
				"namespaceId": "public",
				"table": "ticket_status_log"
			}
		}
	} } } },
	storage: {
		"namespaces": { "public": {
			"entries": { "table": {
				"customer": {
					"columns": {
						"address": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": true,
							"typeParams": { "length": 255 }
						},
						"customer_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"default": {
								"expression": "autoincrement()",
								"kind": "function"
							},
							"nullable": false
						},
						"full_name": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 120 }
						},
						"is_active": {
							"codecId": "pg/bool@1",
							"dataType": "pg/bool",
							"nullable": false
						},
						"phone": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						}
					},
					"foreignKeys": [],
					"indexes": [],
					"primaryKey": { "columns": ["customer_id"] },
					"uniques": [{ "columns": ["phone"] }]
				},
				"device": {
					"columns": {
						"customer_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": false
						},
						"device_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"default": {
								"expression": "autoincrement()",
								"kind": "function"
							},
							"nullable": false
						},
						"is_active": {
							"codecId": "pg/bool@1",
							"dataType": "pg/bool",
							"nullable": false
						},
						"is_external": {
							"codecId": "pg/bool@1",
							"dataType": "pg/bool",
							"nullable": false
						},
						"origin_note": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": true,
							"typeParams": { "length": 200 }
						},
						"purchase_date": {
							"codecId": "pg/date-string@1",
							"dataType": "pg/date",
							"nullable": true
						},
						"serial_no": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 50 }
						},
						"warranty_months": {
							"codecId": "pg/int2@1",
							"dataType": "pg/int2",
							"nullable": false
						}
					},
					"foreignKeys": [{
						"name": "device_customer_id_fkey",
						"source": {
							"columns": ["customer_id"],
							"namespaceId": "public",
							"tableName": "device"
						},
						"target": {
							"columns": ["customer_id"],
							"namespaceId": "public",
							"tableName": "customer"
						}
					}],
					"indexes": [{
						"columns": ["customer_id"],
						"name": "device_customer_id_idx_e16dfa6b",
						"prefix": "device_customer_id_idx",
						"unique": false
					}],
					"primaryKey": { "columns": ["device_id"] },
					"uniques": [{ "columns": ["serial_no"] }]
				},
				"employee": {
					"columns": {
						"center_code": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						},
						"employee_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"default": {
								"expression": "autoincrement()",
								"kind": "function"
							},
							"nullable": false
						},
						"full_name": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 120 }
						},
						"role": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						}
					},
					"foreignKeys": [],
					"indexes": [],
					"primaryKey": { "columns": ["employee_id"] },
					"uniques": []
				},
				"issue_category": {
					"columns": {
						"category_id": {
							"codecId": "pg/int4@1",
							"dataType": "pg/int4",
							"default": {
								"expression": "autoincrement()",
								"kind": "function"
							},
							"nullable": false
						},
						"category_name": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 60 }
						},
						"default_priority": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 10 }
						}
					},
					"foreignKeys": [],
					"indexes": [],
					"primaryKey": { "columns": ["category_id"] },
					"uniques": [{ "columns": ["category_name"] }]
				},
				"ticket": {
					"columns": {
						"category_id": {
							"codecId": "pg/int4@1",
							"dataType": "pg/int4",
							"nullable": false
						},
						"center_code": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						},
						"created_by": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": false
						},
						"customer_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": false
						},
						"device_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": false
						},
						"due_date": {
							"codecId": "pg/timestamptz-string@1",
							"dataType": "pg/timestamptz",
							"nullable": false
						},
						"is_warranty": {
							"codecId": "pg/bool@1",
							"dataType": "pg/bool",
							"nullable": true
						},
						"issue_desc": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 2e3 }
						},
						"priority": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 10 }
						},
						"received_at": {
							"codecId": "pg/timestamptz-string@1",
							"dataType": "pg/timestamptz",
							"nullable": false
						},
						"reject_reason": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": true,
							"typeParams": { "length": 300 }
						},
						"status": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						},
						"ticket_code": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						},
						"ticket_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"default": {
								"expression": "autoincrement()",
								"kind": "function"
							},
							"nullable": false
						},
						"verified_at": {
							"codecId": "pg/timestamptz-string@1",
							"dataType": "pg/timestamptz",
							"nullable": true
						},
						"verified_by": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": true
						}
					},
					"foreignKeys": [
						{
							"name": "ticket_customer_id_fkey",
							"source": {
								"columns": ["customer_id"],
								"namespaceId": "public",
								"tableName": "ticket"
							},
							"target": {
								"columns": ["customer_id"],
								"namespaceId": "public",
								"tableName": "customer"
							}
						},
						{
							"name": "ticket_device_id_fkey",
							"source": {
								"columns": ["device_id"],
								"namespaceId": "public",
								"tableName": "ticket"
							},
							"target": {
								"columns": ["device_id"],
								"namespaceId": "public",
								"tableName": "device"
							}
						},
						{
							"name": "ticket_category_id_fkey",
							"source": {
								"columns": ["category_id"],
								"namespaceId": "public",
								"tableName": "ticket"
							},
							"target": {
								"columns": ["category_id"],
								"namespaceId": "public",
								"tableName": "issue_category"
							}
						},
						{
							"name": "ticket_created_by_fkey",
							"source": {
								"columns": ["created_by"],
								"namespaceId": "public",
								"tableName": "ticket"
							},
							"target": {
								"columns": ["employee_id"],
								"namespaceId": "public",
								"tableName": "employee"
							}
						},
						{
							"name": "ticket_verified_by_fkey",
							"source": {
								"columns": ["verified_by"],
								"namespaceId": "public",
								"tableName": "ticket"
							},
							"target": {
								"columns": ["employee_id"],
								"namespaceId": "public",
								"tableName": "employee"
							}
						}
					],
					"indexes": [
						{
							"columns": ["category_id"],
							"name": "ticket_category_id_idx_da7213d4",
							"prefix": "ticket_category_id_idx",
							"unique": false
						},
						{
							"columns": ["center_code", "due_date"],
							"name": "ticket_center_code_due_date_idx_701fbc3e",
							"prefix": "ticket_center_code_due_date_idx",
							"unique": false
						},
						{
							"columns": ["created_by"],
							"name": "ticket_created_by_idx_e13bb8bf",
							"prefix": "ticket_created_by_idx",
							"unique": false
						},
						{
							"columns": ["customer_id"],
							"name": "ticket_customer_id_idx_e16dfa6b",
							"prefix": "ticket_customer_id_idx",
							"unique": false
						},
						{
							"columns": ["device_id"],
							"name": "ticket_device_id_idx_8f329912",
							"prefix": "ticket_device_id_idx",
							"unique": false
						},
						{
							"columns": ["device_id", "status"],
							"name": "ticket_device_id_status_idx_1a77a0aa",
							"prefix": "ticket_device_id_status_idx",
							"unique": false
						},
						{
							"columns": ["verified_by"],
							"name": "ticket_verified_by_idx_f6af2456",
							"prefix": "ticket_verified_by_idx",
							"unique": false
						}
					],
					"primaryKey": { "columns": ["ticket_id"] },
					"uniques": [{ "columns": ["ticket_code"] }]
				},
				"ticket_status_log": {
					"columns": {
						"changed_at": {
							"codecId": "pg/timestamptz-string@1",
							"dataType": "pg/timestamptz",
							"nullable": false
						},
						"changed_by": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": false
						},
						"from_status": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": true,
							"typeParams": { "length": 20 }
						},
						"log_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"default": {
								"expression": "autoincrement()",
								"kind": "function"
							},
							"nullable": false
						},
						"note": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": true,
							"typeParams": { "length": 255 }
						},
						"ticket_id": {
							"codecId": "pg/int8@1",
							"dataType": "pg/int8",
							"nullable": false
						},
						"to_status": {
							"codecId": "sql/varchar@1",
							"dataType": "pg/varchar",
							"nullable": false,
							"typeParams": { "length": 20 }
						}
					},
					"foreignKeys": [{
						"name": "ticket_status_log_ticket_id_fkey",
						"source": {
							"columns": ["ticket_id"],
							"namespaceId": "public",
							"tableName": "ticket_status_log"
						},
						"target": {
							"columns": ["ticket_id"],
							"namespaceId": "public",
							"tableName": "ticket"
						}
					}, {
						"name": "ticket_status_log_changed_by_fkey",
						"source": {
							"columns": ["changed_by"],
							"namespaceId": "public",
							"tableName": "ticket_status_log"
						},
						"target": {
							"columns": ["employee_id"],
							"namespaceId": "public",
							"tableName": "employee"
						}
					}],
					"indexes": [
						{
							"columns": ["changed_by"],
							"name": "ticket_status_log_changed_by_idx_eac6b555",
							"prefix": "ticket_status_log_changed_by_idx",
							"unique": false
						},
						{
							"columns": ["ticket_id", "changed_at"],
							"name": "ticket_status_log_ticket_id_changed_at_idx_0b08f205",
							"prefix": "ticket_status_log_ticket_id_changed_at_idx",
							"unique": false
						},
						{
							"columns": ["ticket_id"],
							"name": "ticket_status_log_ticket_id_idx_837c90f6",
							"prefix": "ticket_status_log_ticket_id_idx",
							"unique": false
						}
					],
					"primaryKey": { "columns": ["log_id"] },
					"uniques": []
				}
			} },
			"id": "public",
			"kind": "postgres-schema"
		} },
		"storageHash": "3902ff7bedb5595156560cd305c949fcbd0312d1b98fd9c59b61ccb85b09e972"
	},
	capabilities: {
		"postgres": {
			"distinctOn": true,
			"forKeyShare": true,
			"forNoKeyUpdate": true,
			"jsonAgg": true,
			"lateral": true,
			"limit": true,
			"orderBy": true,
			"returning": true
		},
		"sql": {
			"checkConstraint": true,
			"defaultInInsert": true,
			"enums": true,
			"forShare": true,
			"forUpdate": true,
			"insertOnConflictSkip": true,
			"insertOnConflictWithoutTarget": true,
			"lateral": true,
			"lockNowait": true,
			"lockOf": true,
			"lockSkipLocked": true,
			"returning": true,
			"scalarList": true
		}
	},
	extensions: {},
	meta: {},
	_generated: {
		"warning": "⚠️  GENERATED FILE - DO NOT EDIT",
		"message": "This file is automatically generated by \"prisma contract emit\".",
		"regenerate": "To regenerate, run: prisma contract emit"
	}
};
//#endregion
//#region src/prisma/composer.ts
var appContract = dataContract(contract_default);
//#endregion
//#region service.ts
var service_default = compute({
	name: "app",
	deps: { database: postgres$1(appContract) },
	build: node({
		module: import.meta.url,
		dir: "./build",
		entry: "index.js"
	})
});
//#endregion
//#region src/prisma/db.ts
function loadComposerDatabase() {
	try {
		return service_default.load().database.client;
	} catch {
		return;
	}
}
var db = loadComposerDatabase() ?? (process.env.DATABASE_URL ? postgres({
	contractJson: contract_default,
	url: process.env.DATABASE_URL
}) : postgres({ contractJson: contract_default }));
//#endregion
export { unauthenticated as i, ROLE_QUAN_LY as n, forbiddenRole as r, db as t };

//# sourceMappingURL=db.js.map