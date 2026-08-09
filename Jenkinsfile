pipeline {

    agent any

    stages {

        /*
         * 1. Clean workspace and checkout latest code
         */
        stage('Checkout') {

            steps {

                echo '======================================'
                echo 'Cleaning Jenkins workspace...'
                echo '======================================'

                deleteDir()

                echo 'Checking out code from GitHub...'

                checkout scm

                echo '======================================'
                echo 'Checking repository contents...'
                echo '======================================'

                sh '''
                    echo "Current workspace:"
                    pwd

                    echo ""
                    echo "Workspace variable:"
                    echo "$WORKSPACE"

                    echo ""
                    echo "Git commit:"
                    git rev-parse --short HEAD

                    echo ""
                    echo "Git branch:"
                    git branch --show-current

                    echo ""
                    echo "Repository contents:"
                    ls -la
                '''
            }
        }


        /*
         * 2. Verify project structure
         */
        stage('Verify Project Structure') {

            steps {

                echo '======================================'
                echo 'Verifying project structure...'
                echo '======================================'

                sh '''
                    echo "Current directory:"
                    pwd

                    echo ""
                    echo "Workspace:"
                    echo "$WORKSPACE"

                    echo ""
                    echo "Checking frontend directory..."
                    test -d "$WORKSPACE/frontend"
                    ls -ld "$WORKSPACE/frontend"
                    ls -la "$WORKSPACE/frontend"

                    echo ""
                    echo "Checking API directory..."
                    test -d "$WORKSPACE/api"
                    ls -ld "$WORKSPACE/api"
                    ls -la "$WORKSPACE/api"

                    echo ""
                    echo "Checking database directory..."
                    test -d "$WORKSPACE/database"
                    ls -ld "$WORKSPACE/database"
                    ls -la "$WORKSPACE/database"

                    echo ""
                    echo "Checking docker-compose.yml..."
                    test -f "$WORKSPACE/docker-compose.yml"
                    ls -l "$WORKSPACE/docker-compose.yml"

                    echo ""
                    echo "Checking Jenkinsfile..."
                    test -f "$WORKSPACE/Jenkinsfile"
                    ls -l "$WORKSPACE/Jenkinsfile"

                    echo ""
                    echo "Project structure verified successfully."
                '''
            }
        }


        /*
         * 3. Validate Docker Compose file
         */
        stage('Validate Docker Compose') {

            steps {

                echo '======================================'
                echo 'Validating Docker Compose configuration...'
                echo '======================================'

                sh '''
                    docker compose config
                '''
            }
        }


        /*
         * 4. Create Docker secrets
         *
         * Secrets are stored in Jenkins Credentials.
         * They are NOT stored in GitHub.
         */
        stage('Create Docker Secrets') {

            steps {

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

                        echo "Creating Docker secret files..."

                        mkdir -p "$WORKSPACE/secrets"

                        printf '%s' "$MYSQL_ROOT_PASSWORD" \
                        > "$WORKSPACE/secrets/mysql_root_password"

                        printf '%s' "$MYSQL_USER" \
                        > "$WORKSPACE/secrets/mysql_user"

                        printf '%s' "$MYSQL_PASSWORD" \
                        > "$WORKSPACE/secrets/mysql_password"

                        printf '%s' "$MYSQL_DATABASE" \
                        > "$WORKSPACE/secrets/mysql_database"

                        chmod 600 "$WORKSPACE/secrets"/*

                        echo "Docker secret files created successfully."

                        echo ""
                        echo "Secret files:"
                        ls -la "$WORKSPACE/secrets"
                    '''
                }
            }
        }


        /*
         * 5. Build Docker images
         */
        stage('Build Docker Images') {

            steps {

                echo '======================================'
                echo 'Building Docker images...'
                echo '======================================'

                sh '''
                    echo "Checking frontend before Docker build..."
                    ls -la "$WORKSPACE/frontend"

                    echo ""
                    echo "Checking API before Docker build..."
                    ls -la "$WORKSPACE/api"

                    echo ""
                    echo "Building Docker images..."

                    docker compose build
                '''
            }
        }


        /*
         * 6. Deploy application
         */
        stage('Deploy Docker Application') {

            steps {

                echo '======================================'
                echo 'Starting Docker containers...'
                echo '======================================'

                sh '''
                    docker compose up -d
                '''
            }
        }


        /*
         * 7. Check running containers
         */
        stage('Verify Containers') {

            steps {

                echo '======================================'
                echo 'Checking Docker containers...'
                echo '======================================'

                sh '''
                    docker compose ps
                '''
            }
        }


        /*
         * 8. Check API health
         */
        stage('Health Check') {

            steps {

                echo '======================================'
                echo 'Checking API health...'
                echo '======================================'

                sh '''
                    echo "Waiting for application to start..."
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

    }

}
