# Configuração do ambiente Nix para Replit
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.npm-9_x
    pkgs.git
    pkgs.curl
    pkgs.which
    pkgs.bash
    pkgs.typescript
  ];
}
