const sendAccountDisabledEmail = (firstName: string): string => `
<!DOCTYPE html>
<html>
  <head>
    <title>Account Disabled</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body
    style="
      margin: 0;
      padding: 50px 0px;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
    "
  >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table
            width="600"
            border="0"
            cellspacing="0"
            cellpadding="0"
            style="
              background: #ffffff;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              width: 90%;
              max-width: 600px;
            "
          >
            <tr>
              <td align="center">
                <img
                  src="https://res.cloudinary.com/dtjgywfrm/image/upload/v1738827485/Password_Reset_licvrk.jpg"
                  alt="Account Disabled"
                  style="
                    width: 100%;
                    max-width: 600px;
                    height: auto;
                    display: block;
                  "
                />
              </td>
            </tr>
            <tr style="background: linear-gradient(to right, #ffe3e3, #ffffff)">
              <td style="padding: 20px 30px">
                <h3
                  style="
                    text-align: center;
                    color: #b80000;
                    font-size: 20px;
                    font-weight: 700;
                  "
                >
                  Your Account Has Been Disabled
                </h3>
                <p style="font-size: 16px">Dear ${firstName || "User"},</p>
                <p style="font-size: 16px">
                  Your account has been disabled due to multiple failed login attempts.
                  For your security, please contact our support team to reactivate your account.
                </p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="mailto:support@yourdomain.com" style="background-color: #b80000; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block; font-weight: bold; text-align: center;">
                    Contact Support
                  </a>
                </p>
                <p style="font-size: 14px">
                  If you did not attempt to log in, please contact our security team immediately.
                </p>
                <p style="color: #333; font-size: 14px">
                  Best regards,<br />Security Team<br />
                  <a
                    href="https://www.yourdomain.com/"
                    style="color: #007bff; text-decoration: none"
                  >
                    www.yourdomain.com
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- ✅ Mobile Styles -->
    <style>
      @media screen and (max-width: 480px) {
        table {
          width: 100% !important;
        }

        td {
          padding: 15px !important;
        }

        h3 {
          font-size: 18px !important;
        }

        p {
          font-size: 14px !important;
        }

        span {
          font-size: 20px !important;
        }
      }
    </style>
  </body>
</html>`;

export default sendAccountDisabledEmail;
