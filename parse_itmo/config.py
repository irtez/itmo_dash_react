import os

# Config that serves all environment
GLOBAL_CONFIG = {
    'links' : {
        '09 04 01': 'https://abit.itmo.ru/rating/master/budget/1896',
        '11 04 02': 'https://abit.itmo.ru/rating/master/budget/1917',
        '27 04 05': 'https://abit.itmo.ru/rating/master/budget/1954'
    }
}

# Environment specific config, or overwrite of GLOBAL_CONFIG
ENV_CONFIG = {
    "development": {
        "DEBUG": True
    },

    "production": {
        "DEBUG": False
    }
}


def get_config() -> dict:
    """
    Get config based on running environment
    :return: dict of config
    """

    # Determine running environment
    ENV = os.environ['PYTHON_ENV'] if 'PYTHON_ENV' in os.environ else 'development'
    ENV = ENV or 'development'

    # raise error if environment is not expected
    if not ENV in ENV_CONFIG.keys():
        raise EnvironmentError(f'Config for envirnoment {ENV} not found')

    config = GLOBAL_CONFIG.copy()
    config.update(ENV_CONFIG[ENV])

    config['ENV'] = ENV

    return config

# load config for import
CONFIG = get_config()

if __name__ == '__main__':
    # for debugging
    import json
    print(json.dumps(CONFIG, indent=4))
