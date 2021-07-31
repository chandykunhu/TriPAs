import { InputBoxOptions, window } from "vscode";
import * as vscode from 'vscode';
import TripasStatus from "./TripasTimerStatus";
import Timer from "./TripasTimer";

class Tripas {
	// properties
	private _status: TripasStatus;
	private tripasIndex: number = 0;
	private isClicked: boolean = false;


	public get status() {
		return this._status;
	}
	public set status(status: TripasStatus) {
		this._status = status;
	}

	private _timer: Timer;

	public get timer() {
		return this._timer;
	}

	// events
	public onTick: () => void;

	constructor(public workTime: number = 3 * 60, public pauseTime: number = 1 * 60,
		public lunchTime: number = 1 * 60) {
		this.workTime = Math.floor(this.workTime);
		this.pauseTime = Math.floor(this.pauseTime);
		this.lunchTime = Math.floor(this.lunchTime);

		this._timer = new Timer();
		this.status = TripasStatus.None;
	}

	// private methods
	private done() {
		this.stop();
		this.status = TripasStatus.Done;
	}

	private resetTimer(status: TripasStatus) {
		if (status === TripasStatus.Work) {
			this.timer.reset(this.workTime);
		}
		if (status === TripasStatus.Rest) {
			this.timer.reset(this.pauseTime);
		}
		if (status === TripasStatus.Lunch) {
			this.timer.reset(this.lunchTime);
		}
	}

	// public methods
	public start(status: TripasStatus = TripasStatus.Work) {
		if (status === TripasStatus.Work || status === TripasStatus.Rest || status === TripasStatus.Lunch) {
			if (this.status !== TripasStatus.Paused) {
				this.resetTimer(status);
			}
			this.status = status;
			const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
			this._timer.start(async () => {
				// stop the timer if no second left
				if (this.timer.currentTime <= 0) {
					if (this.status === TripasStatus.Work) {
						if (this.tripasIndex === 2) {
							this.isClicked = false;
							this.timer.stop();

							let Yes = 'Yes';
							let No = 'Need more Time';
							vscode.window.showInformationMessage('Its Lunch Time, Begin the AI Process?', Yes, No)
								.then(selection => {
									if (selection === Yes) {
										//vscode.env.openExternal(vscode.Uri.parse(
										//'https://www.merriam-webster.com/dictionary/hep'));

										//Do Automatic Process here

										this.workTime = 20;
										this.isClicked = true;
										this.start(TripasStatus.Lunch);
									}
									if (selection === No) {
										this.isClicked = true;
										this.tripasIndex--;
										this.workTime = 30;
										this.start(TripasStatus.Work);
									}
								});

							await delay(10000);
							if (!this.isClicked) {
								this.tripasIndex = 1;
								this.workTime = 30;
								this.start(TripasStatus.Work);
							}

						}
						else {
							window.showInformationMessage("Work done! Take a break.");
							this.start(TripasStatus.Rest);
						}
						this.tripasIndex++;
					}
					else if (this.status === TripasStatus.Rest) {
						window.showInformationMessage("Please resume the work.");

						this.start(TripasStatus.Work);
					}
					else if (this.status === TripasStatus.Lunch) {

						window.showInformationMessage("AI work done. Please resume work.");

						this.start(TripasStatus.Work);
					}
				}

				if (this.onTick) {
					this.onTick();
				}
			});
		}
		else {
			console.error("Start timer error");
		}
	}

	public pause() {
		this.stop();
		this.status = TripasStatus.Paused;
	}

	public reset() {
		this.stop();
		this.status = TripasStatus.None;
		this._timer.currentTime = this.workTime;
	}

	public stop() {
		this._timer.stop();
	}

	public dispose() {
		this.stop();
		this.status = TripasStatus.None;
	}
}

export default Tripas;
