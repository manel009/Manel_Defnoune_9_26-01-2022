/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, fireEvent } from "@testing-library/dom"
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

            test("If this file has an unsupported format", () => {

                // initialisation
                const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
                const html = NewBillUI()
                document.body.innerHTML = html

                // mock pour l'alert
                window.alert = jest.fn()
                jest.spyOn(window, 'alert').mockImplementation(() => {});

                let containerNewBill = new NewBill({
                    document,
                    onNavigate,
                    store: null,
                    localStorage: window.localStorage,
                })

                // utilisation d'un fichier valide pour le test
                const image = new File(['test'], 'fileKO.pdf', { type: 'application/pdf' })
                const fileInput = screen.getByTestId('file')
                const handleChange = jest.fn(containerNewBill.handleChangeFile)
                fileInput.addEventListener('change', (e) => {
                    handleChange(e);
                })
                userEvent.upload(fileInput, image)

                // verifie si la methode a ete appele et si on a bien le fichier
                expect(handleChange).toHaveBeenCalled()
                expect(containerNewBill.fileName).toBeNull()
                expect(window.alert).toBeCalledWith("Format de fichier invalide !");
            })
        })

        describe("When I complete the form ", () => {
            test("If I submit a correct form, it should create a new bill and return to the Bills page", () => {
                // initialisation
                const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
                const html = NewBillUI()
                document.body.innerHTML = html

                let containerNewBill = new NewBill({
                    document,
                    onNavigate,
                    store: null,
                    localStorage: window.localStorage,
                })

                // création d'un bill de test
                const email = JSON.parse(localStorage.getItem('user')).email
                const testBill = {
                    email,
                    type: 'Transports',
                    name: 'Test',
                    amount: 100,
                    date: '2022-01-28',
                    vat: '70',
                    pct: 20,
                    commentary: 'Test commentaire',
                    fileUrl: 'https://test.com/test.jpg',
                    fileName: 'test.jpg',
                    status: 'pending'
                }

                // Remplissage du formulaire avec les valeurs du test
                const form = screen.getByTestId("form-new-bill")
                screen.getByTestId("expense-type").value = testBill.type
                screen.getByTestId("expense-name").value = testBill.name
                screen.getByTestId("datepicker").value = testBill.date
                screen.getByTestId("amount").value = testBill.amount
                screen.getByTestId("vat").value = testBill.vat
                screen.getByTestId("commentary").value = testBill.commentary
                containerNewBill.fileUrl = 'https://test.com/test.jpg'
                containerNewBill.fileName = 'test.jpg'

                // mock de la methode handleSubmit 
                const handleSubmit = jest.spyOn(containerNewBill, 'handleSubmit')
                containerNewBill.createBill = (containerNewBill) => containerNewBill
                form.addEventListener('submit', handleSubmit)
                fireEvent.submit(form)

                // on verifie que le submit a bien ete appele et qu'on est bien revenu sur "Mes notes de frais"
                expect(handleSubmit).toHaveBeenCalled()
                expect(screen.getByText(/Mes notes de frais/i)).toBeTruthy()
            })
        })

    })
})