#!/usr/bin/env python3
"""
Fallback script para caso o Repl seja criado como Python
Este script redireciona para o servidor Node.js
"""

import subprocess
import sys
import os

def main():
    print("🔄 Detectado ambiente Python, redirecionando para Node.js...")
    
    # Verificar se Node.js está disponível
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
        print("✅ Node.js encontrado!")
    except subprocess.CalledProcessError:
        print("❌ Node.js não encontrado. Instale Node.js 18+ primeiro.")
        sys.exit(1)
    
    # Verificar se npm está disponível
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
        print("✅ npm encontrado!")
    except subprocess.CalledProcessError:
        print("❌ npm não encontrado. Instale npm primeiro.")
        sys.exit(1)
    
    # Instalar dependências se necessário
    if not os.path.exists("node_modules"):
        print("📦 Instalando dependências npm...")
        subprocess.run(["npm", "install"], check=True)
    
    # Build se necessário
    if not os.path.exists("dist"):
        print("🔨 Compilando TypeScript...")
        subprocess.run(["npm", "run", "build"], check=True)
    
    # Executar servidor Node.js
    print("🚀 Iniciando servidor MCP Node.js...")
    try:
        subprocess.run(["npm", "run", "replit"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Servidor encerrado pelo usuário.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao executar servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
