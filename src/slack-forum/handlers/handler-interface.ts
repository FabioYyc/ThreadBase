import { AckFn, App, SlackAction } from "@slack/bolt";
import { WebClient } from "@slack/web-api";

export type SlackTriggerHandlerOptions = {
  app: App;
  ack: AckFn<any>;
  body: SlackAction;
  client: WebClient;
};

export abstract class SlackTriggerHandler {
  protected readonly app: App;
  protected ack: AckFn<any>;
  protected body: SlackAction;
  protected client: WebClient;
  constructor(options: SlackTriggerHandlerOptions) {
    this.app = options.app;
    this.ack = options.ack;
    this.body = options.body;
    this.client = options.client;
  }
  public setDataProcessor(dataProcessor: () => Promise<void>): void {
    this.processData = dataProcessor;
  }
  public setViewPreparer(viewPreparer: () => Promise<void>): void {
    this.prepareView = viewPreparer;
  }
  public setViewAction(viewAction: () => Promise<void>): void {
    this.viewAction = viewAction;
  }
  abstract processData(): Promise<void>;
  abstract prepareView(): Promise<void>;
  abstract viewAction(): Promise<void>;
  public async process(): Promise<void> {
    await this.ack();
    await this.processData();
    await this.prepareView();
    await this.viewAction();
  }
}
