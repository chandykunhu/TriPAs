import { StatusBarAlignment, StatusBarItem, window } from "vscode";

import Tripas from "./TripasTimerModule";
import TripasStatus from "./TripasTimerStatus";

class TripasManager {
	// logic properties
	private _tripasIndex: number;
	public tripasi: Tripas[];

	public get currentTripas() {
		return this.tripasi[this._tripasIndex];
	}

	public get currentState() {
		switch (this.currentTripas.status) {
			case TripasStatus.Work:
				return " - Work Time";
			case TripasStatus.Rest:
				return " - Rest Time";
			case TripasStatus.Lunch:
				return " - Lunch Time";
			case TripasStatus.Paused:
				return " - paused";
			case TripasStatus.Break:
					return " - break";
			default:
				return "";
		}
	}

	public get isSessionFinished(): boolean {
		return !this.currentTripas;
	}

	// UI properties
	private _statusBarText: StatusBarItem;

	constructor(public workTime: number = 2, public pauseTime: number = 0.5, public lunchTime: number = 1) {
		// create status bar items
		if (!this._statusBarText) {
			this._statusBarText = window.createStatusBarItem(StatusBarAlignment.Left);
			this._statusBarText.show();
		}
		
		this.reset();
		this.draw();
	}

	// private methods
	private update() {
		// handle launch of the next Tripas
		if (this.currentTripas.status === TripasStatus.Done) {
			this._tripasIndex++;

			if (!this.isSessionFinished) {
				this.start();
			}
		}
	}

	private draw() {
		if (this.isSessionFinished) {
			// show text when all Tripas sessions are over
			//this._statusBarText.text = "Restart session?";
	
			// show message if user needs a longer break
			if (this.tripasi.length > 1) {
				window.showInformationMessage("Well done! You should now take a longer break.");
			}

			return;
		}

		const seconds = this.currentTripas.timer.currentTime % 60;
		const minutes = (this.currentTripas.timer.currentTime - seconds) / 60;

		// update status bar (text)
		const timerPart = ((minutes < 10) ? "0" : "") + minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;

		let tripasNumberPart = "";
		if (this.tripasi.length > 1) {
			tripasNumberPart += " (" + (this._tripasIndex + 1) + " out of " + this.tripasi.length + " tripasi)";
		}

		this._statusBarText.text = timerPart + this.currentState + tripasNumberPart;

		this._statusBarText.show();
	}

	// public methods
	public start() {
		// launch a new session if the previous is already finished
		if (this.isSessionFinished) {
			this._tripasIndex = 0;
		}

		this.currentTripas.start();
		this.currentTripas.onTick = () => {
			this.update();
			this.draw();
		};
	}

	public pause() {
		this.currentTripas.pause();

		this.update();
		this.draw();
	}

	public reset() {
		this._tripasIndex = 0;
		this.tripasi = [];

		this.tripasi.push(new Tripas(this.workTime * 60, this.pauseTime * 60,this.lunchTime * 60));
	}

	public dispose() {
		// stop current Tripas
		this.currentTripas.dispose();

		// reset UI
		this._statusBarText.dispose();
	}
}

export default TripasManager;
