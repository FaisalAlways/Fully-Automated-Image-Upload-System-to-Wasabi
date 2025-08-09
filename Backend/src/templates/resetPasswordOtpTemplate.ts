const resetPasswordTemplate = (
  firstName: string,
  otp: number,
  expiresAt: number
): string => `
<!DOCTYPE html>
<html>
  <head>
    <title>Email Verification</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin: 0; padding: 50px 0px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background: #ffffff; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); width: 90%; max-width: 600px;">
            <tr>
              <td align="center">
                <img src="https://res.cloudinary.com/dtjgywfrm/image/upload/v1738827485/Password_Reset_licvrk.jpg" 
                  alt="Logo" style="width: 100%; max-width: 600px; height: auto; display: block;" />
              </td>
            </tr>
            <tr style="background: linear-gradient(to right, #d9ddff, #ffffff)">
              <td style="padding: 20px 30px;">
                <h3 style="text-align: center; color: #002175; font-size: 20px; font-weight: 700;">
                  Reset Your HO Institute Password
                </h3>
                <p style="font-size: 16px;">Dear ${firstName},</p>
                <p style="font-size: 16px;">
                  We received a request to reset your password for your 
                  <strong style="color: #007bff">Help Operation Institute!</strong> account. 
                  Use the OTP below to reset your password:
                </p>
                <p style=" font-size: 18px; font-weight: bold;">
                  Your OTP Code: <span style="color: #007bff; font-size: 22px;">${otp}</span>
                </p>
                <p style="font-size: 14px;">
                  This code is valid for ${expiresAt} minutes. If you didn’t request a password reset, please ignore this email or contact our support team immediately.
                </p>
                <p style="font-size: 14px;">
                  For any assistance, feel free to contact our support team.
                </p>
                <p style="color: #333; font-size: 14px;">
                  Best regards,<br />Help Operation Institute<br />
                  <a href="https://www.hoinstitute.com/" style="color: #007bff; text-decoration: none;">www.hoinstitute.com/</a>
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
</html>

`;

export default resetPasswordTemplate;
