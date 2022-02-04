/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { screen } from "@testing-library/dom"

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

import { ROUTES_PATH } from '../constants/routes'
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
    })
})