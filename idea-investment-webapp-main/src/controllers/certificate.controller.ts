// Uncomment these imports to begin using these cool features!
import {
  authenticate,
  TokenService,
  UserService,
} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  FilterExcludingWhere,
  InclusionFilter,
  repository,
} from '@loopback/repository';
import {
  get,
  HttpErrors,
  oas,
  param,
  Response,
  RestBindings,
} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import puppeteer from 'puppeteer';
import {UserServiceBindings} from '../keys';
import {Order, User} from '../models';
import {Credentials, OrderRepository, UserRepository} from '../repositories';
import {UserManagementService} from '../services';
// const puppeteer = require('puppeteer');
// import {} from '../../public'
import {ordersFilter} from '../helpers/filters/order.filters';
const fs = require('fs');
export class CertificateController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_SERVICE)
    public userManagementService: UserManagementService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
    @repository(OrderRepository)
    public orderRepository: OrderRepository,
  ) {}

  @authenticate('jwt')
  @authorize({permissions: ['*']})
  @get('/certificate/{orderId}')
  @oas.response.file()
  async find(
    //-------Getting current userID ---------//
    // @inject(AuthenticationBindings.CURRENT_USER)
    // currentUserProfile: UserProfile,
    //--------------------------------------//
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.number('orderId') orderId: number,
    @param.filter(Order, {exclude: 'where'})
    filter?: FilterExcludingWhere<Order>,
  ): Promise<any> {
    let include: InclusionFilter[] = ordersFilter;
    const orderData = await this.orderRepository.findById(orderId, {
      ...filter,
      include,
    });
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    const res = `<div>
    <div>
      <div
        style="
          position: relative;
          width: 400px;
          height:580px ;
          padding: 0;
          border: 8px solid #71665F;
          background-color: #F3FEEB;
          background-image: none;
        "
      >
        <div>
          <span
            style="
              color: #71665F;
              font-weight: bold;
              text-align: right;
              padding-right: 10px;
              display: flex;
              justify-content: end;
            "
          >
            Certificate No :306
          </span>
          <div
            style="
              position: relative;
              top: 20px;
              text-align: center;
            "
          >
            <h1
              style="
                font-weight: bold;
                color: red;
                font-size: 30px;
                font-family:'Great Vibes';
              "
            >
              Share Certificate
            </h1>
          </div>
          <div>
            <p
              style="
                color: #71665F;
                padding-top: 20px;
                fontclass-nameyle: normal;
                padding-left: 30px;
                padding-right: 30px;
              "
            >
              A company incorporated under the companies act
              2006 England and Wales with regiclassNameration
              number ..............
            </p>
          </div>
          <div>
            <p style="font-weight: bold; text-align: center">
              This is to certify thant
            </p>
          </div>
          <div>
            <p style="font-weight: bold; text-align: center">
                    ${orderData?.orderBy?.fullName}
            </p>
          </div>
          <div>
            <p
              style="
                color: #71665F;
                font-family: Great Vibes;
                text-align: center;
                fontclass-nameyle: normal;
                padding-left: 30px;
                padding-right: 30px;
              "
            >
           is the regiclassNameered holder of fully paid
                $ ${orderData?.transaction?.paidAmount} share(s) of $ ${orderData?.project?.targetInvest} (four Million
                American Dollars Only)
            </p>
          </div>
          <div>
            <p
              style="
                color: black;
                text-align: center;
                font-weight: bold;
                padding:2px
              "
            >
        ${orderData?.project?.name}
            </p>
          </div>
          <div>
            <p
              style="
                color: #71665F;
                font-family: Great Vibes;
                text-align: center;
                fontclass-nameyle: normal;
                padding-left: 30px;
                padding-right: 30px;
                padding-top: 10px;
                -padding-bottom: 10px;
              "
            >
              subject to articles oof association of the
              company. Given under the signature of the
              director.
            </p>
          </div>
          <div
            style="
              font-size: 20px;
              padding-top: 10px;
              display: flex;
              justify-content: space-around;
              font-style: oblique;
              font-family: cursive;
            "
          >
            <div>
              <div
                style="
                  z-index: 20;
                  height: auto;
                  width: 80px;
                  position: absolute;
                  top: 430px;
                  left: 250px;
                "
              >
                <img
                  src="https://www.freepnglogos.com/uploads/signature-png/antonin-scalia-signature-png-picture-download-22.png"
                  style="
                    height: 100%;
                    width: 100%;
                    object-fit: cover;
                  "
                />
              </div>
              <span style="font-family: Great Vibes">
                 Date:${day}-${month}-${year}
              </span>
            </div>
            <div style = "    z-index: 20;
            height: auto;
            width: 40px;
            position: absolute;
            top: 400px;
            left: 170px;" >
            <img src = 'https://idea-supreme.s3.ap-south-1.amazonaws.com/logo.png'
            style="
            height: 100%;
            width: 100%;
            object-fit: cover;
          "
            />
            </div>
            <div>
              <span style="font-family: Great Vibes"></span>
            </div>
          </div>
          <div>
            <p
              style="
                color: black;
                font-size: 8px;
                text-align: center;
                font-weight: bold;
                fontclass-nameyle: normal;
                padding-left: 30px;
                padding-right: 30px;
                padding-top: 20px;
              "
            >
              This certificate muclassName be surrendered
              before any transfer of the whole or part of the
              shares herein mentioned can be regiclassNameere
              given under the signature of a Company Director
              in accordance with the provision of the
              Companies Act 2006, there being no requirement
              for a common seal. No Transfer of any of the
              above shares can be regiclassNameered unless
              accompanied by the certificate.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
    const sendPDF = async () => {
      try {
        const browser = await puppeteer.launch({
          executablePath: '/usr/bin/chromium-browser',
          // comment before using in local computer
        });
        // Create a new browser context.
        const page = await browser.newPage();
        // Do stuff
        await page.addStyleTag({
          content: '@page { size: a4; }',
        });
        // adding html to pdf
        await page.setContent(res);
        const pdf = await page.pdf({
          format: 'A6',
          landscape: false,
          margin: {
            top: 0,
            bottom: 0,
            right: 10,
            left: 3,
          },
          printBackground: true,
        });
        return pdf;
      } catch (err) {
        return HttpErrors + 'Unable to download file' + err;
      }
    };
    const pdf = await sendPDF();
    response.contentType('application/pdf').send(pdf);
    return response;
  }
}
