pipeline {

    /*
     * Use a separate workspace for every build.
     * This prevents another Jenkins job/build from
     * deleting or modifying our workspace.
     */
    agent {
        node {
            customWorkspace "/var/lib/jenkins/workspace/docker-project-${BUILD_NUMBER}"
        }
    }

    options {

        /*
         * Do not perform Jenkins automatic checkout.
         * We checkout manually below.
         */
        skipDefaultCheckout(true)

        /*
         * Prevent two builds of this job from running together.
         */
        disableConcurrentBuilds()
    }

    stages {

        /*
         * 1. Checkout source code
         */
        stage('Checkout') {

            steps {

                echo '======================================'
                echo 'WORKSPACE'
                echo '======================================'

                sh '''
                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Build number:"
                    echo "$BUILD_NUMBER"

                    echo ""
                    echo "Workspace path:"
                    echo "$WORKSPACE"
                '''

                echo '======================================'
                echo 'Cleaning workspace'
                echo '======================================'

                deleteDir()

                echo '======================================'
                echo 'Checking out Git repository'
                echo '======================================'

                checkout scm

                sh '''
                    set -e

                    echo "======================================"
                    echo "GIT COMMIT"
                    echo "======================================"

                    git rev-parse --short HEAD

                    echo "======================================"
                    echo "REPOSITORY CONTENTS"
                    echo "======================================"

                    ls -la

                    echo "======================================"
                    echo "FRONTEND"
                    echo "======================================"

                    ls -la ./frontend

                    echo "======================================"
                    echo "API"
                    echo "======================================"

                    ls -la ./api

                    echo "======================================"
                    echo "DATABASE"
                    echo "======================================"

                    ls -la ./database

                    echo "======================================"
                    echo "DOCKER COMPOSE"
                    echo "======================================"

                    ls -l ./docker-compose.yml

                    echo "======================================"
                    echo "CHECKOUT SUCCESSFUL"
                    echo "======================================"
                '''
            }
        }


        /*
         * 2. Validate Docker Compose
         */
        stage('Validate Docker Compose') {

            steps {

                echo '======================================'
                echo 'Validating Docker Compose'
                echo '======================================'

                sh '''
                    docker compose config
                '''
            }
        }


        /*
         * 3. Create Docker Secrets
         */
        stage('Create Docker Secrets') {

            steps {

                echo '======================================'
                echo 'Creating Docker Secrets'
                echo '======================================'

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

                        echo "Docker secrets created."

                        ls -la secrets
                    '''
                }
            }
        }


        /*
         * 4. Build Docker Images
         */
        stage('Build Docker Images') {

            steps {

                echo '======================================'
                echo 'Building Docker Images'
                echo '======================================'

                sh '''
                    set -e

                    echo "Workspace:"
                    pwd

                    echo ""
                    echo "Frontend:"
                    ls -la ./frontend

                    echo ""
                    echo "API:"
                    ls -la ./api

                    echo ""
                    echo "Building images..."

                    docker compose build
                '''
            }
        }


        /*
         * 5. Deploy application
         */
        stage('Deploy Docker Application') {

            steps {

                echo '======================================'
                echo 'Deploying Docker Application'
                echo '======================================'

                sh '''
                    docker compose up -d
                '''
            }
        }


        /*
         * 6. Verify containers
         */
        stage('Verify Containers') {

            steps {

                echo '======================================'
                echo 'Verifying Containers'
                echo '======================================'

                sh '''
                    docker compose ps
                '''
            }
        }


        /*
         * 7. Health Check
         */
        stage('Health Check') {

            steps {

                echo '======================================'
                echo 'Checking API Health'
                echo '======================================'

                sh '''
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
            echo 'Pipeline completed'
            echo '======================================'
        }
    }
}
