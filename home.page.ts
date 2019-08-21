import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

	private file: MediaObject = null;
	playing: boolean = false;
	private playAudio: any = '';
	private theCheckerStream: any = false;
	private orientation: string = 'portrait';
	private musicControlsClose;
	private streaming: string = 'linkdaradio';
	private cover = 'linkdacapa';

	constructor(private menu: MenuController, 
		public plt: Platform, 
		private midia: Media,
		private screenOrientation: ScreenOrientation, 
		private loadingController: LoadingController, 
		private musicControls: MusicControls){

		this.plt.ready().then( () => {

			this.loadingOverlay(100000);
			this.initNativeMedia();
			this.initMediaNotificarion();
			this.lockOrientation();

		});

		

	}

   loadingOverlay(time){
   	
   	this.loadingController.create({
   		message: 'Carregando Rádio...',
   		duration: time
   	}).then((overlay) => {
   		const loading = overlay;
   		loading.present();	
   		this.closeLoading(loading);
   	});
   
   }


	lockOrientation(){
		this.screenOrientation.lock(this.orientation);
	}


	openFirst() {
	    this.menu.enable(true, 'first');
	    this.menu.open('first');
	 }

	closeMenu(){
		this.menu.close('first');
	}



//NATIVE MEDIA
	initNativeMedia(){
   		this.file = this.midia.create(this.streaming);
        this.file.onSuccess.subscribe(() => console.log('Action is successful'));
        this.file.onError.subscribe(error => console.log('Error!', error));
        this.file.release();
    	this.file.play();
    	this.playing = true;
   }

	closeLoading(loading){

   		const verify = setInterval(() => {

   			this.file.getCurrentPosition().then((position) => {
  					
  					if(position >= 0){
  						window.clearInterval(verify);
    					loading.dismiss();
  					}
				});

    		
    	}, 2000);
   }

   playRadio(){

    this.file.play();
    this.loadingOverlay(100000);
    this.playing = true;

    if(this.musicControlsClose){
    	this.initMediaNotificarion();
    }else{
    	this.musicControls.updateIsPlaying(true);
    }

   }

   stopRadio(){

  	this.file.stop();
  	this.release();
  	this.playing = false;
  	this.musicControls.updateIsPlaying(false);

   }

  release(){
  	this.file.release();
   }

   	// NOTIFICATION

	   initMediaNotificarion(){

   		this.musicControls.create({
			track       : 'Gabadi Online',		// optional, default : ''
			artist      : 'A Potência Gospel de Diamantina',						// optional, default : ''
			album       : 'PIB Diamantina',     // optional, default: ''
		 	cover       : this.cover,		// optional, default : nothing
			// cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
			//			 or a remote url ('http://...', 'https://...', 'ftp://...')
			isPlaying   : true,							// optional, default : true
			dismissable : true,							// optional, default : false

			// hide previous/next/close buttons:
			hasPrev   : false,		// show previous button, optional, default: true
			hasNext   : false,		// show next button, optional, default: true
			hasClose  : true,		// show close button, optional, default: false

			// Android only, optional
			// text displayed in the status bar when the notification (and the ticker) are updated
			ticker	  : 'Now playing "Time is Running Out"',
			//All icons default to their built-in android equivalents
			//The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
			playIcon: 'media_play',
			pauseIcon: 'media_pause',
			prevIcon: 'media_prev',
			nextIcon: 'media_next',
			closeIcon: 'media_close',
			notificationIcon: 'notification'
		});

    	// Register callback
		this.musicControls.subscribe().subscribe(action => this.musicControlEvents(action));

		// Start listening for events
		// The plugin will run the events function each time an event is fired
		this.musicControls.listen();
		this.musicControls.updateIsPlaying(true); // toggle the play/pause notification button	
		this.musicControlsClose = false;

   }

   musicControlEvents(action){

   		const message = JSON.parse(action).message;

					switch(message) {
						case 'music-controls-next':
							break;
						case 'music-controls-previous':
							break;
						case 'music-controls-pause':
							this.musicControlsSetButton();
							break;
						case 'music-controls-play':
							this.musicControlsSetButton();
							break;
						case 'music-controls-destroy':
						  	this.musicControlsSetButton();
							this.musicControls.destroy().then(() => {
								this.musicControlsClose = true;
								this.playing = false;
							});
							break;
						
						default:
							break;
					}
   }


 eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

musicControlsSetButton(){
   		this.eventFire(document.getElementById('button'), 'click');
   }

}
