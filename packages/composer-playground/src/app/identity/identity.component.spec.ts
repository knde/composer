/* tslint:disable:no-unused-variable */
/* tslint:disable:no-unused-expression */
/* tslint:disable:no-var-requires */
/* tslint:disable:max-classes-per-file */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IdentityComponent } from './identity.component';
import { AlertService } from '../basic-modals/alert.service';
import { IdentityService } from '../services/identity.service';
import { ClientService } from '../services/client.service';

import * as chai from 'chai';

import * as sinon from 'sinon';
import { ConnectionProfileService } from '../services/connectionprofile.service';
import { WalletService } from '../services/wallet.service';

let should = chai.should();

@Component({
    selector: 'app-footer',
    template: ''
})
class MockFooterComponent {

}

describe(`IdentityComponent`, () => {

    let component: IdentityComponent;
    let fixture: ComponentFixture<IdentityComponent>;

    let mockModal;
    let mockAlertService;
    let mockIdentityService;
    let mockClientService;
    let mockConnectionProfileService;
    let mockWalletService;

    beforeEach(() => {

        mockModal = sinon.createStubInstance(NgbModal);
        mockAlertService = sinon.createStubInstance(AlertService);
        mockIdentityService = sinon.createStubInstance(IdentityService);
        mockClientService = sinon.createStubInstance(ClientService);
        mockConnectionProfileService = sinon.createStubInstance(ConnectionProfileService);
        mockWalletService = sinon.createStubInstance(WalletService);

        mockAlertService.errorStatus$ = {
            next: sinon.stub()
        };

        mockAlertService.busyStatus$ = {next: sinon.stub()};

        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [
                IdentityComponent,
                MockFooterComponent
            ],
            providers: [
                {provide: NgbModal, useValue: mockModal},
                {provide: AlertService, useValue: mockAlertService},
                {provide: IdentityService, useValue: mockIdentityService},
                {provide: ClientService, useValue: mockClientService},
                {provide: ConnectionProfileService, useValue: mockConnectionProfileService},
                {provide: WalletService, useValue: mockWalletService}
            ]
        });

        fixture = TestBed.createComponent(IdentityComponent);

        component = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
        it('should create the component', () => {
            component.should.be.ok;
        });

        it('should load the component', () => {
            let loadMock = sinon.stub(component, 'loadIdentities');

            component.ngOnInit();

            loadMock.should.have.been.called;
        });
    });

    describe('load identities', () => {
        it('should load the identities', fakeAsync(() => {
            mockIdentityService.getCurrentIdentities.returns(Promise.resolve(['idOne', 'idTwo']));
            mockIdentityService.getCurrentIdentity.returns(Promise.resolve('my identity'));

            component.loadIdentities();

            tick();

            component['identities'].should.deep.equal(['idOne', 'idTwo']);
            component['currentIdentity'].should.equal('my identity');
        }));

        it('should give an alert if there is an error', fakeAsync(() => {

            mockIdentityService.getCurrentIdentities.returns(Promise.resolve(['idOne', 'idTwo']));
            mockIdentityService.getCurrentIdentity.returns(Promise.reject('some error'));

            component.loadIdentities();

            tick();

            component['identities'].should.deep.equal(['idOne', 'idTwo']);
            should.not.exist(component['currentIdentity']);

            mockAlertService.errorStatus$.next.should.have.been.called;
        }));
    });

    describe('addId', () => {
        it('should add the id', fakeAsync(() => {
            mockModal.open = sinon.stub().returns({
                result: Promise.resolve()
            });

            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            component.addId();

            tick();

            mockLoadIdentities.should.have.been.called;
            mockModal.open.should.have.been.called;
        }));

        it('should handle an error', fakeAsync(() => {
            mockModal.open = sinon.stub().returns({
                result: Promise.reject('some error')
            });

            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            component.addId();

            tick();

            mockAlertService.errorStatus$.next.should.have.been.called;
            mockLoadIdentities.should.not.have.been.called;
            mockModal.open.should.have.been.called;
        }));

        it('should handle escape being pressed', fakeAsync(() => {
            mockModal.open = sinon.stub().returns({
                result: Promise.reject(1)
            });

            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            component.addId();

            tick();

            mockAlertService.errorStatus$.next.should.not.have.been.called;
            mockLoadIdentities.should.not.have.been.called;
            mockModal.open.should.have.been.called;
        }));
    });

    describe('issueNewId', () => {
        beforeEach(() => {
            mockModal.open.reset();
        });

        it('should issue id', fakeAsync(() => {
            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');
            mockModal.open.onFirstCall().returns({
                result: Promise.resolve({userID: 'myId', userSecret: 'mySecret'})
            });

            mockModal.open.onSecondCall().returns({
                componentInstance: {},
                result: Promise.resolve()
            });

            component.issueNewId();

            tick();

            mockLoadIdentities.should.have.been.called;
        }));

        it('should handle error in id creation', fakeAsync(() => {
            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            mockModal.open.onFirstCall().returns({
                result: Promise.reject('some error')
            });

            component.issueNewId();

            tick();

            mockModal.open.should.have.been.calledOnce;

            mockAlertService.errorStatus$.next.should.have.been.called;

            mockLoadIdentities.should.have.been.called;
        }));

        it('should handle escape being pressed', fakeAsync(() => {
            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            mockModal.open.onFirstCall().returns({
                result: Promise.reject(1)
            });

            component.issueNewId();

            tick();

            mockModal.open.should.have.been.calledOnce;

            mockAlertService.errorStatus$.next.should.not.have.been.called;

            mockLoadIdentities.should.have.been.called;
        }));

        it('should handle id in id displaying', fakeAsync(() => {
            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            mockModal.open.onFirstCall().returns({
                result: Promise.resolve({userID: 'myId', userSecret: 'mySecret'})
            });

            mockModal.open.onSecondCall().returns({
                componentInstance: {},
                result: Promise.reject('some error')
            });

            component.issueNewId();

            tick();

            mockLoadIdentities.should.not.have.been.called;

            mockAlertService.errorStatus$.next.should.have.been.called;
        }));

        it('should not issue identity if cancelled', fakeAsync(() => {
            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            mockModal.open.onFirstCall().returns({
                result: Promise.resolve()
            });

            component.issueNewId();

            tick();

            mockAlertService.errorStatus$.next.should.not.have.been.called;
            mockLoadIdentities.should.have.been.called;

        }));
    });

    describe('setCurrentIdentity', () => {
        it('should set the current identity', fakeAsync(() => {
            mockClientService.ensureConnected.returns(Promise.resolve());

            component.setCurrentIdentity('bob');

            tick();

            component['currentIdentity'].should.equal('bob');
            mockIdentityService.setCurrentIdentity.should.have.been.calledWith('bob');
            mockClientService.ensureConnected.should.have.been.calledWith(true);
            mockAlertService.busyStatus$.next.should.have.been.calledTwice;
        }));

        it('should do nothing if the new identity matches the current identity', fakeAsync(() => {
            mockClientService.ensureConnected.returns(Promise.resolve());
            component['currentIdentity'] = 'bob';

            component.setCurrentIdentity('bob');

            tick();

            component['currentIdentity'].should.equal('bob');
            mockIdentityService.setCurrentIdentity.should.not.have.been.called;
            mockClientService.ensureConnected.should.not.have.been.called;
            mockAlertService.busyStatus$.next.should.not.have.been.called;
        }));

        it('should handle errors', fakeAsync(() => {
            mockClientService.ensureConnected.returns(Promise.reject('Testing'));

            component.setCurrentIdentity('bob');

            tick();

            mockAlertService.busyStatus$.next.should.have.been.calledTwice;
            mockAlertService.busyStatus$.next.should.have.been.calledWith(null);
            mockAlertService.errorStatus$.next.should.have.been.called;
        }));
    });

    describe('removeIdentity', () => {
        it('should remove the identity from the wallet', fakeAsync(() => {
            mockConnectionProfileService.getCurrentConnectionProfile.returns('myProfile');

            mockWalletService.removeFromWallet.returns(Promise.resolve());

            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            component.removeIdentity('fred');

            tick();

            mockConnectionProfileService.getCurrentConnectionProfile.should.have.been.called;
            mockWalletService.removeFromWallet.should.have.been.calledWith('myProfile', 'fred');
            mockLoadIdentities.should.have.been.called;

        }));

        it('should handle error', fakeAsync(() => {
            mockConnectionProfileService.getCurrentConnectionProfile.returns('myProfile');

            mockWalletService.removeFromWallet.returns(Promise.reject('some error'));

            let mockLoadIdentities = sinon.stub(component, 'loadIdentities');

            component.removeIdentity('fred');

            tick();

            mockConnectionProfileService.getCurrentConnectionProfile.should.have.been.called;
            mockWalletService.removeFromWallet.should.have.been.calledWith('myProfile', 'fred');
            mockLoadIdentities.should.not.have.been.called;

            mockAlertService.errorStatus$.next.should.have.been.calledWith('some error');
        }));
    });
});
