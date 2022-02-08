/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { localStorageMock } from '../__mocks__/localStorage.js'
import store from "../../src/app/Store.js"
import { ROUTES } from '../constants/routes'
import Router from '../app/Router.js'

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
    describe("When I am on NewBill Page", () => {
        describe("When I upload a file in the form ", () => {
            test("If this file is an image with an accepted format", () => {

                // initialisation
                const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
                const html = NewBillUI()
                document.body.innerHTML = html

                // mock pour les appels depuis store
                const mockThen = {
                    catch: jest.fn().mockReturnThis()
                }
                const mockCreate = {
                    then: jest.fn().mockReturnValue(mockThen)
                }
                const mockBills = {
                    create: jest.fn().mockReturnValue(mockCreate)
                }
                const mockStore = {
                    bills: jest.fn().mockReturnValue(mockBills)
                }
                let containerNewBill = new NewBill({
                    document,
                    onNavigate,
                    store: mockStore,
                    localStorage: window.localStorage,
                })

                // utilisation d'un fichier valide pour le test
                const image = new File(['test'], 'imageOK.jpg', { type: 'image/jpg' })
                const fileInput = screen.getByTestId('file')
                const handleChange = jest.fn(containerNewBill.handleChangeFile)
                fileInput.addEventListener('change', (e) => {
                    handleChange(e);
                })
                userEvent.upload(fileInput, image)

                // verifie si la methode a ete appele et si on a bien le fichier
                expect(handleChange).toHaveBeenCalled()
                expect(fileInput.files[0]).toStrictEqual(image)
                expect(fileInput.files).toHaveLength(1)
            })
        })
    })
})