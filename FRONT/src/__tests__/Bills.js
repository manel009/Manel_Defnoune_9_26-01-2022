/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"

import { ROUTES, ROUTES_PATH } from '../constants/routes'
import Router from '../app/Router.js'
import { localStorageMock } from '../__mocks__/localStorage.js'

// On se connect en tant qu'employee avant les tests
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})
window.localStorage.setItem(
    'user',
    JSON.stringify({
        type: 'Employee',
    })
)

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", () => {
            const html = BillsUI({ data: [] });
            document.body.innerHTML = html;

            // On dit qu'on veut aller vers la page bills
            window.location.assign(ROUTES_PATH['Bills']);
            document.body.innerHTML = `<div id='root'></div>`;
            // on execute le router qui va genere le html de la page bill
            Router();

            // on recupere l'icone bill du vertical layout avec son data test id
            const iconBill = screen.getByTestId('icon-window');
            // on verifie qu'il a la class active-icon
            expect(iconBill).toHaveClass('active-icon');

        })
        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills })
            document.body.innerHTML = html
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })

        test("Then I can click on the NewBill button to access to the form", () => {
            // initialisation  
            const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
            const html = BillsUI({ data: bills })
            document.body.innerHTML = html
            const containerBills = new Bills({
                document,
                onNavigate,
                firestore: null,
                localStorage: null
            })

            // creation du mock de handleClickNewBill
            const handleClickNewBill = jest.spyOn(containerBills, 'handleClickNewBill')
            const btnNewBill = screen.getByTestId('btn-new-bill')

            // on associe le mock a l'event click du bouton 
            btnNewBill.addEventListener('click', handleClickNewBill)

            //on simule le clique
            userEvent.click(btnNewBill)
                // on verifi que le mock a bien ete appele au clique
            expect(handleClickNewBill).toHaveBeenCalled()

            // on recupere le form pour cree un bill et on verifie qu'il est genere
            const formNewBill = screen.getByTestId('form-new-bill')
            expect(formNewBill).toBeTruthy()

        })
    })


    describe('When I click on the icon eye', () => {
        test('A modal should open', () => {
            // mock des fonction modal
            $.fn.modal = jest.fn()

            // initialisation  
            const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
            const html = BillsUI({ data: bills })
            document.body.innerHTML = html
            const containerBills = new Bills({
                document,
                onNavigate,
                firestore: null,
                localStorage: null
            })

            // mock pour la fonction handleClickIconEye
            const handleClickIconEye = jest.spyOn(containerBills, 'handleClickIconEye')
            const firstIconEye = screen.getAllByTestId('icon-eye')[0]
            firstIconEye.addEventListener('click', handleClickIconEye(firstIconEye))

            // on test le click sur l'icone
            userEvent.click(firstIconEye)
            expect(handleClickIconEye).toHaveBeenCalled()

            // on verifi que le modal est bien apparu
            const modale = screen.getByTestId('modaleFile')
            expect(modale).toBeTruthy()
        })
    })
})