import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered? : boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {

    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    AUTH_SIGNUP_URL: string = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
    AUTH_LOGIN_URL: string = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            this.AUTH_SIGNUP_URL + environment.firebaseAPIKey,
            {
                email, 
                password, 
                returnSecureToken: true // always === true
            }
        )
        .pipe(catchError(this.handleError), tap(resData => {
            this.handleAuthentication(
                resData.email, 
                resData.localId, 
                resData.idToken, 
                +resData.expiresIn
            );
        }));
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            this.AUTH_LOGIN_URL + environment.firebaseAPIKey,
            {
                email, 
                password, 
                returnSecureToken: true // always === true
            }
        )
        .pipe(catchError(this.handleError), tap(resData => {
            this.handleAuthentication(
                resData.email, 
                resData.localId, 
                resData.idToken, 
                +resData.expiresIn
            );
        }));
    }

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }
        const loadedUser = new User(
            userData.email, 
            userData.id, 
            userData._token, 
            new Date(userData._tokenExpirationDate)
        );
        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn*1000);
        const user = new User(
            email, 
            userId, 
            token, 
            expirationDate
        );
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured!';
            if (!errorRes.error || !errorRes.error.error) {
                return throwError(errorMessage);
            }
            switch (errorRes.error.error.message) {
                // signup
                case 'EMAIL_EXISTS':
                    errorMessage = 'The email address is already in use by another account.';
                    break;
                case 'OPERATION_NOT_ALLOWED':
                    errorMessage = 'Password sign-in is disabled for this project.';
                    break;
                case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                    errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
                    break;
                    // login
                case 'EMAIL_NOT_FOUND':
                    errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
                    break;
                case 'INVALID_PASSWORD':
                    errorMessage = 'The password is invalid or the user does not have a password.';
                    break;
                case 'USER_DISABLED':
                    errorMessage = 'The user account has been disabled by an administrator.';
                    break
                    // general
                default:
                    errorMessage = 'Unknown ERROR! :)';
                    break;
            }
            return throwError(errorMessage);
    }
}