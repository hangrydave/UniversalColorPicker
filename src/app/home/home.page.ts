import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { Color } from '../interfaces/color';
import { AuthService } from '../services/auth.service';
import { ColorsService } from '../services/colors.service';
import { PhotoService } from '../services/photo.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public colors: Color[] = [];

  constructor(
    private photoService: PhotoService,
    private colorService: ColorsService,
    private authService: AuthService,
    private navCtrl: NavController,
    private loadingController: LoadingController,
    private clipboard: Clipboard,
    private toastController: ToastController,
    private auth: Auth) {
      // this.colorService.getColors().subscribe(colors => {
      //   this.colors = colors;
      // });
    onAuthStateChanged(auth, async (user: User | null) => {
      this.colors = [];
      console.log(`auth state changed: ${user?.uid ?? 'no uid'}`);
      if (user) {
        await this.colorService.load(user?.uid ?? null);
        this.colorService.getColors().subscribe(colors => {
          this.colors = colors;
        });
      }
    });
  }

  // ionViewDidEnter() {
  //   const currentUser = this.authService.getCurrentUser();
  //   console.log("ionViewWillEnter: " + currentUser);
  //   // this.refreshColors();
  // }

  async signInButtonClicked() {
    let userIsSignedIn: boolean = !!this.authService.getCurrentUser();
    if (userIsSignedIn) {
      let loadingElement = await this.loadingController.create();
      await loadingElement.present();
      await this.authService.signUserOut();
      await loadingElement.dismiss();

      this.colors = [];
    } else {
      await this.navCtrl.navigateForward('/login');
    }
  }

  getSignInButtonText(): string {
    const currentUser = this.authService.getCurrentUser();
    let userIsSignedIn: boolean = !!currentUser;
    return userIsSignedIn ? 'Sign Out' : 'Sign In';
  }

  takePhoto() {
    // this.navCtrl.navigateForward('camera-page');
    console.log(`colors in home page: ${this.colors}`);
  }

  removeColor(color: Color) {
    this.colorService.removeColor(color.id);
  }

  async copyVal(color: Color) {
    this.clipboard.copy(color.value);
    console.log('Hex copied');
    const toast = await this.toastController.create({
      message: 'Copied to clipboard',
      duration: 1500,
      position: 'bottom',
    });
    await toast.present();
  }
}
