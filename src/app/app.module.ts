import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { HttpClientModule } from '@angular/common/http'

// external packages
import { CUSTOM_COMPONENTS, MATERIAL_COMPONENTS } from './components.all'

// Material

// ngrx
import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
import { StoreRouterConnectingModule, RouterStateSerializer } from '@ngrx/router-store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'

// app configuration
import { AppRouting } from './app.routing'
import { AppService } from './app.service'

import { CustomSerializer } from './utils/router-store'

// ngrx
import { reducers, metaReducers } from './reducers'

import Effects from './effects'
import { AccountService } from './services/account.service'

// apollo
import { ApolloModule, Apollo } from 'apollo-angular'
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'

// Component
import { AppComponent } from './app.component'

@NgModule({
  declarations: [
    ...CUSTOM_COMPONENTS,
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    // apollo
    ApolloModule,
    HttpLinkModule,

    // routes
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(Effects),
    StoreRouterConnectingModule,
    StoreDevtoolsModule.instrument({
      maxAge: 25 // Retains last 25 states
      // logOnly: environment.production, // Restrict extension to log-only mode
    }),

    AppRouting,

    ...MATERIAL_COMPONENTS

  ],
  providers: [
    AppService,
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    AccountService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  httpLink: HttpLink
  apollo: Apollo

  constructor (apollo: Apollo, httpLink: HttpLink) {
    this.apollo = apollo
    this.httpLink = httpLink
    this.createApollo()
  }

  createApollo () {
    const http = this.httpLink.create({ uri: '/graphql' })
    const auth = setContext((_, { headers }) => {
      const token = localStorage.getItem('token')

      if (!token) {
        return {}
      } else {
        return {
          headers: headers.append('Authorization', `JWT ${token}`)
        }
      }
    })

    this.apollo.create({
      link: auth.concat(http),
      cache: new InMemoryCache()
    })
  }
}
