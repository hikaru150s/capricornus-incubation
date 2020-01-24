export abstract class BaseDriver {
  public abstract connection(): any;
  public abstract async init(options?: any): Promise<void>;
}
