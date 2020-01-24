import { Request } from 'express';

enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

interface IFilterPair {
  [key: string]: string | number;
}

interface IParsedQuery {
  direction: SortDirection;
  filter: IFilterPair;
  limit: number;
  page: number;
  sort: string;
}

export function parseRequest(req: Request): IParsedQuery {
  const query = req.query;
  const filterPair: IFilterPair = {};
  Object.keys(query).filter(v => /_like$/.test(v)).forEach(k => {
    filterPair[k.substr(0, k.length - 5)] = query[k];
  });
  return {
    sort: query._sort || 'id',
    direction: query._order ? query._order.toUpperCase() : SortDirection.ASC,
    page: query && query._page ? query._page - 1 : 0,
    limit: query._limit || 25,
    filter: filterPair,
  };
}
