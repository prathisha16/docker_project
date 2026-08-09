pipeline {

    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    environment {
        BUILD_WS = "/var/lib/jenkins/workspace/docker-project-${BUILD_NUMBER}"
    }

    stages {

        /*
         * 1. Checkout
         */
        stage('Checkout') {
            steps {

                ws("${env.BUILD_WS}") {

                    echo '======================================'
                    echo 'Using isolated workspace'
                    echo '======================================'

                    echo "Workspace: ${env.BUILD_WS}"

                    deleteDir()

                    echo 'Checking out source code...'

                    checkout scm

                    sh '''
                        set -e

                        echo "======================================"
                        echo "GIT COMMIT"
                        echo "======================================"

                        git rev-parse --short HEAD

                        echo "======================================"
                        echo "FILES CHECKED OUT"
                        echo "======================================"

                        find . -maxdepth 2 -print | sort

                        echo "======================================"
                        echo "FRONTEND"
                        echo "======================================"

                        ls -la frontend

                        echo "======================================"
                        echo "API"
                        echo "======================================"

                        ls -la api

                        echo "======================================"
                        echo "DATABASE"
                        echo "======================================"

                        ls -la database

                        echo "======================================"
                        echo "DOCKER COMPOSE"
                        echo "======================================"

                        ls -l docker-compose.yml

                        echo "======================================"
                        echo "CHECKOUT SUCCESSFUL"
                        echo "======================================"
                    '''
                }
            }
        }


        /*
         * 2. Validate Docker Compose
         */
        stage('Validate Docker Compose') {
            steps {

                ws("${env.BUILD_WS}") {

                    echo '======================================'
                    echo 'Validating Docker Compose'
                    echo '======================================'

                    sh '''
                        set -e

                        docker compose config
                    '''
                }
            }
        }


        /*
         * 3. Create Docker Secrets
         */
        stage('Create Docker Secrets') {
            steps {

                ws("${env.BUILD_WS}") {

                    withCredentials([

                        string(
                            credentialsId: 'mysql-root-password',
                            variable: 'MYSQL_ROOT_PASSWORD'
                        ),

                        string(
                            credentialsId: 'mysql-user',
                            variable: 'MYSQL_USER'
                        ),

                        string(
                            credentialsId: 'mysql-password',
                            variable: 'MYSQL_PASSWORD'
                        ),

                        string(
                            credentialsId: 'mysql-database',
                            variable: 'MYSQL_DATABASE'
                        )

                    ]) {

                        sh '''
                            set +x

                            echo "======================================"
                            echo "Creating Docker secrets"
                            echo "======================================"

                            mkdir -p secrets

                            printf '%s' "$MYSQL_ROOT_PASSWORD" \
                                > secrets/mysql_root_password

                            printf '%s' "$MYSQL_USER" \
                                > secrets/mysql_user

                            printf '%s' "$MYSQL_PASSWORD" \
                                > secrets/mysql_password

                            printf '%s' "$MYSQL_DATABASE" \
                                > secrets/mysql_database

                            chmod 600 secrets/*

                            echo "Docker secrets created successfully."

                            ls -la secrets
                        '''
                    }
                }
            }
        }


        /*
         * 4. Build Docker Images
         */
        stage('Build Docker Images') {
            steps {

                ws("${env.BUILD_WS}") {

                    echo '======================================'
                    echo 'Building Docker Images'
                    echo '======================================'

                    sh '''
                        set -e

                        echo "Workspace:"
                        pwd

                        echo ""
                        echo "Frontend:"
                        ls -la frontend

                        echo ""
                        echo "API:"
                        ls -la api

                        echo ""
                        echo "Building Docker images..."

                        docker compose build
                    '''
                }
            }
        }


        /*
         * 5. Deploy Docker Application
         */
        stage('Deploy Docker Application') {
            steps {

                ws("${env.BUILD_WS}") {

                    echo '======================================'
                    echo 'Deploying Docker Application'
                    echo '======================================'

                    sh '''
                        set -e

                        docker compose up -d
                    '''
                }
            }
        }


        /*
         * 6. Verify Containers
         */
        stage('Verify Containers') {
            steps {

                ws("${env.BUILD_WS}") {

                    echo '======================================'
                    echo 'Verifying Docker Containers'
                    echo '======================================'

                    sh '''
                        set -e

                        docker compose ps
                    '''
                }
            }
        }


        /*
         * 7. Health Check
         */
        stage('Health Check') {
            steps {

                ws("${env.BUILD_WS}") {

                    echo '======================================'
                    echo 'Checking API Health'
                    echo '======================================'

                    sh '''
                        set -e

                        echo "Waiting for application..."
                        sleep 15

                        echo "Checking API health..."

                        curl -f http://localhost:5000/health

                        echo ""
                        echo "API health check successful."
                    '''
                }
            }
        }
    }


    /*
     * Pipeline result
     */
    post {

        success {
            echo '======================================'
            echo 'Docker application deployed successfully!'
            echo '======================================'
        }

        failure {
            echo '======================================'
            echo 'Docker deployment failed!'
            echo '======================================'
        }

        always {
            echo '======================================'
            echo "Pipeline completed - Build ${env.BUILD_NUMBER}"
            echo '======================================'
        }
    }
}
