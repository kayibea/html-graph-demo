export default class Mouse {
  public downX: number;
  public downY: number;
  public downed: boolean;
  constructor(public x = 0, public y = 0) {
    this.downed = false;
    this.downX = 0;
    this.downY = 0;
  }
}
