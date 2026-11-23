import { expect, test } from '@playwright/test';

test('registra una cuenta desde el formulario visible y envía los datos esperados', async ({ page }) => {
  let solicitudRegistro;
  await page.route('**/api/v1/auth/registro', async (route) => {
    solicitudRegistro = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ mensaje: 'Usuario registrado correctamente.' })
    });
  });

  await page.goto('/registro');
  const form = page.locator('#formRegistro');
  await form.getByLabel('Nombre completo').fill('Carolina Morales');
  await form.getByLabel('Correo electrónico').fill('carolina@example.cl');
  await form.getByLabel('Número de teléfono').fill('912345678');
  await form.getByLabel('Contraseña', { exact: true }).fill('clave-segura');
  await form.getByLabel('Confirmar contraseña').fill('clave-segura');
  await form.getByLabel('Acepto los términos y condiciones.').check();
  await form.getByRole('button', { name: 'Crear cuenta' }).click();

  await expect(page.getByRole('alert')).toContainText('¡Cuenta creada correctamente!');
  expect(solicitudRegistro).toEqual({
    nombre: 'Carolina Morales',
    correo: 'carolina@example.cl',
    telefono: '912345678',
    password: 'clave-segura'
  });
});
