/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { excludeField } from "../constants";

export class PrismaQueryBuilder<TWhere = any> {
  public where: TWhere = {} as TWhere;
  public orderBy: any = {};
  public select: any = undefined;
  public skip = 0;
  public take = 10;

  constructor(private readonly query: Record<string, any>) {}

  filter(): this {
    const filter = { ...this.query };

    // ✅ Define all special query params that should NOT go into where clause
    const reservedFields = [
      ...excludeField,
      "searchTerm",
      "type",
      "status",
      "fromDate",
      "toDate",
      "from", // ✅ Handle both naming conventions
      "to", // ✅ Handle both naming conventions
      "sortBy",
      "sortOrder",
      "page",
      "limit",
      "fields",
    ];

    // Remove all reserved fields
    for (const field of reservedFields) {
      delete filter[field];
    }

    // Only add remaining valid fields to where clause
    this.where = {
      ...this.where,
      ...filter,
    };

    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;

    if (searchTerm) {
      this.where = {
        ...this.where,
        OR: searchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      } as TWhere;
    }

    return this;
  }

  dateRange(dateField = "submittedDate"): this {
    // ✅ Handle multiple date param naming conventions
    const fromDate =
      this.query.fromDate || this.query.from || this.query.startDate;
    const toDate = this.query.toDate || this.query.to || this.query.endDate;

    if (fromDate || toDate) {
      const dateFilter: any = {};

      if (fromDate) {
        dateFilter.gte = new Date(fromDate);
      }

      if (toDate) {
        // Add 1 day to include the entire end date
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.lt = endDate;
      }

      this.where = {
        ...this.where,
        [dateField]: dateFilter,
      } as TWhere;
    }

    return this;
  }

  filterByType(): this {
    const { type } = this.query;

    if (type && type !== "All Types") {
      this.where = {
        ...this.where,
        type: type.toUpperCase(),
      } as TWhere;
    }

    return this;
  }

  filterByStatus(): this {
    const { status } = this.query;

    if (status && status !== "All Statuses") {
      this.where = {
        ...this.where,
        status: status.toUpperCase(),
      } as TWhere;
    }

    return this;
  }

  sort(): this {
    const sortBy = this.query.sortBy || "submittedDate";
    const sortOrder = this.query.sortOrder === "asc" ? "asc" : "desc";

    this.orderBy = {
      [sortBy]: sortOrder,
    };

    return this;
  }

  fields(): this {
    if (this.query.fields) {
      const fieldsArray = this.query.fields.split(",");
      this.select = fieldsArray.reduce((acc: any, field: string) => {
        acc[field] = true;
        return acc;
      }, {});
    }

    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    this.skip = (page - 1) * limit;
    this.take = limit;

    return this;
  }

  build() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      select: this.select,
      skip: this.skip,
      take: this.take,
    };
  }

  getMeta(total: number) {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }
}
