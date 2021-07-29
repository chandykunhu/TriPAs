import { InputBoxOptions, window } from "vscode";

import TripasStatus from "./TripasTimerStatus";
import Timer from "./TripasTimer";

class Tripas {
	// properties
	private _status: TripasStatus;
	

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

	constructor(public workTime: number = 1 * 60, public pauseTime: number = 0.5 * 60) {
		this.workTime = Math.floor(this.workTime);
		this.pauseTime = Math.floor(this.pauseTime);

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
	}

	// public methods
	public start(status: TripasStatus = TripasStatus.Work) {
		if (status === TripasStatus.Work || status === TripasStatus.Rest) {
			if (this.status !== TripasStatus.Paused) {
				this.resetTimer(status);
			}
			let options: InputBoxOptions = {
				prompt: "Label: ",
				placeHolder: "(placeholder)"
			}
			
			this.status = status;

			this._timer.start(() => {
				// stop the timer if no second left
				if (this.timer.currentTime <= 0) {
					if (this.status === TripasStatus.Work) {
						window.showInformationMessage("Work done! Take a break.");
						this.start(TripasStatus.Rest);

					}
					else if (this.status === TripasStatus.Rest) {
						window.showInformationMessage("Please resume the work.",);
						window.showInputBox(options).then(value => {
							if (!value) return;
							const answer1 = value;
							// show the next dialog, etc.
						});
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
