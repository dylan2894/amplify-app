import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Auth } from 'aws-amplify';
import { Subscription } from 'rxjs';
import { APIService, User } from './API.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  isSubmitted: boolean = false;
  createForm: FormGroup;
  private subscription: Subscription | null = null;
  public users: Array<User> = [];


  constructor(private api: APIService) {
    this.createForm = new FormGroup({
      user_email: new FormControl('', [Validators.required, Validators.email]),
      user_password: new FormControl('', [Validators.required]),
      user_repeatedPassword: new FormControl('', [Validators.required]),
      user_name: new FormControl('', [Validators.required])
    });
  }

  ngOnInit() {
    this.api.ListUsers().then((users) => {
      console.log(users);
    });

    this.subscription = <Subscription>(
      this.api.OnCreateUserListener.subscribe((event: any) => {
        const newUser = event.value.data.onCreateUser;
        this.users = [newUser, ...this.users];
      })
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = null;
  }

  onCreate(user: any) {
    this.isSubmitted = true;

    const newUser: User = {
      userID: 1,
      user_email: user.user_email,
      user_password: user.user_password,
      user_name: user.user_name
    }

    this.api
      .CreateUser(newUser)
      .then((event) => {
        console.log('item created!');
        this.createForm.reset();
      })
      .catch((e) => {
        console.log('error creating user...', e);
      });
  }

  // async signUp() {
  //   try {
  //     const { user } = await Auth.signUp({
  //       username,
  //       password,
  //       attributes: {
  //         email,          // optional
  //         phone_number,   // optional - E.164 number convention
  //         // other custom attributes
  //       }
  //     });
  //     console.log(user);
  //   } catch (error) {
  //     console.log('error signing up:', error);
  //   }
  // }

  get email() { return this.createForm.get('email'); }
  get password() { return this.createForm.get('password'); }
  get repeatedPassword() { return this.createForm.get('repeatedPassword'); }
  get name() { return this.createForm.get('name'); }
}
