const LOGO_URL = "https://res.cloudinary.com/matu2982/image/upload/v1783977128/logo_yf70lh.png";

export function replyTemplate(replyText: string, leadName: string, agentName?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#EEF6F6;font-family:'SF Pro Display','Helvetica Neue',Helvetica,Arial,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF6F6;padding:20px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <tr>
          <td align="center" style="padding:30px 0 20px;">
            <img src="${LOGO_URL}" alt="Luxe Estate" width="160" style="max-width:160px;height:auto;display:block;border:0;">
          </td>
        </tr>

        <tr>
          <td style="background-color:#ffffff;border-radius:16px;padding:0;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td style="background:linear-gradient(135deg,#006655,#19322F);border-radius:16px 16px 0 0;padding:36px 40px 28px;text-align:center;">
                  <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 4px;letter-spacing:-0.3px;">
                    Respuesta de Luxe Estate
                  </h1>
                  <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">
                    ${leadName}, hemos recibido tu consulta
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:32px 40px 24px;">
                  <p style="color:#19322F;font-size:15px;line-height:1.6;margin:0 0 16px;">
                    Hola <strong>${leadName}</strong>,
                  </p>
                  <p style="color:#19322F;font-size:15px;line-height:1.6;margin:0 0 20px;">
                    Gracias por contactarte con <strong style="color:#006655;">Luxe Estate</strong>. 
                    A continuación recibirás respuesta de nuestro equipo:
                  </p>

                  <div style="background-color:#EEF6F6;border-radius:10px;padding:20px;margin:0 0 24px;">
                    <p style="color:#19322F;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">
                      ${replyText.replace(/\n/g, "<br>")}
                    </p>
                  </div>

                  <p style="color:#6b7a78;font-size:13px;line-height:1.5;margin:0;">
                    Si tenés más preguntas, no dudes en responder este email o contactarnos directamente.
                  </p>

                  <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0 16px;">

                  <p style="color:#6b7a78;font-size:12px;line-height:1.5;margin:0;">
                    Saludos,<br>
                    <strong style="color:#006655;">${agentName ? agentName : "El equipo de Luxe Estate"}</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:20px 20px 10px;">
            <p style="color:#8a9e9b;font-size:11px;margin:0 0 6px;">
              &copy; 2026 Luxe Estate. Todos los derechos reservados.
            </p>
            <p style="color:#8a9e9b;font-size:11px;margin:0;">
              Este es un mensaje automático de la plataforma Luxe Estate.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}
